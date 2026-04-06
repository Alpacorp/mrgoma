import { VarChar, Decimal, Int, NVarChar } from 'mssql';

import { getPool } from '@/connection/db';
import { logger } from '@/utils/logger';

export interface InsertOrderInput {
  orderSatusId: number; // note: column name has a typo in DB
  store: string; // from VaultId of products (as string). If multiple: 'MIXED'. If unknown: '0'
  orderTotal?: number | null; // decimal(18,2)
  customerIP?: string | null; // varchar(20)
  paymentMethodId?: number | null; // optional, unknown mapping
  paymentStatusId?: number | null; // optional, unknown mapping
  stripeSessionId?: string | null; // Stripe Checkout Session ID for idempotency
}

export interface InsertOrderResult {
  orderId: number;
  orderGuid: string;
}

/**
 * Returns the existing SC_Order for a given Stripe session ID, or null if not found.
 */
export async function getOrderByStripeSessionId(
  stripeSessionId: string
): Promise<InsertOrderResult | null> {
  const pool = await getPool();
  const request = pool.request();
  request.input('StripeSessionId', NVarChar(255), stripeSessionId);
  const result = await request.query(`
    SELECT TOP 1 Id AS orderId, CAST(OrderGuid AS NVARCHAR(36)) AS orderGuid
    FROM dbo.SC_Order
    WHERE StripeSessionId = @StripeSessionId
  `);
  const row = result.recordset?.[0] as any;
  if (!row) return null;
  return { orderId: row.orderId as number, orderGuid: row.orderGuid as string };
}

/**
 * Inserts a new order into dbo.SC_Order using minimal, safe fields.
 * Returns the newly created order Id and OrderGuid.
 */
export async function insertOrder(input: InsertOrderInput): Promise<InsertOrderResult> {
  const pool = await getPool();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const request = transaction.request();

    // Normalize values
    const store = (input.store ?? '').toString().trim().slice(0, 50) || '0';
    const customerIP = (input.customerIP ?? '').toString().trim().slice(0, 20) || null;

    // Optional fields (allow null)
    const orderTotal =
      typeof input.orderTotal === 'number' && isFinite(input.orderTotal)
        ? Number(input.orderTotal.toFixed(2))
        : null;

    // Defaults required by business rules
    const paymentMethodId =
      typeof input.paymentMethodId === 'number' ? input.paymentMethodId : 3; // default 3
    const paymentStatusId =
      typeof input.paymentStatusId === 'number' ? input.paymentStatusId : 2; // default 2

    const stripeSessionId =
      typeof input.stripeSessionId === 'string' && input.stripeSessionId.trim()
        ? input.stripeSessionId.trim().slice(0, 255)
        : null;

    // Bind parameters (always bind, even if null)
    request.input('OrderSatusId', Int, input.orderSatusId);
    request.input('Store', VarChar(50), store);
    request.input('OrderTotal', Decimal(18, 2), orderTotal as any);
    request.input('CustomerIP', VarChar(20), customerIP as any);
    request.input('PaymentMethodId', Int, paymentMethodId);
    request.input('PaymentStatusId', Int, paymentStatusId);
    request.input('StripeSessionId', NVarChar(255), stripeSessionId as any);

    // Perform a concurrency-safe insert with a computed next OrdenNumber
    const sql = `
      SET NOCOUNT ON;
      DECLARE @nextOrden int;
      SELECT @nextOrden = ISNULL(MAX(OrdenNumber), 0) + 1
      FROM dbo.SC_Order WITH (UPDLOCK, HOLDLOCK);

      INSERT INTO dbo.SC_Order (
        CreationDate,
        OrderGuid,
        OrderSatusId,
        Store,
        OrdenNumber,
        DiscountId,
        PaymentMethodId,
        PaymentStatusId,
        BillingAddressId,
        ShippingAddressId,
        ShippingStatusId,
        OrderTotal,
        CustomerIP,
        StripeSessionId
      )
      OUTPUT INSERTED.Id AS orderId, INSERTED.OrderGuid AS orderGuid
      VALUES (
        GETDATE(),
        NEWID(),
        @OrderSatusId,
        @Store,
        @nextOrden,
        0,             -- DiscountId
        @PaymentMethodId,
        @PaymentStatusId,
        0,             -- BillingAddressId
        0,             -- ShippingAddressId
        1,             -- ShippingStatusId
        @OrderTotal,
        @CustomerIP,
        @StripeSessionId
      );`;

    const result = await request.query(sql);
    await transaction.commit();

    const row = (result.recordset && result.recordset[0]) as any;
    const orderId = row?.orderId as number;
    const orderGuid = row?.orderGuid as string;

    if (!orderId || !orderGuid) {
      throw new Error('Failed to retrieve inserted order identifiers');
    }

    logger.info(`Inserted SC_Order id=${orderId}, guid=${orderGuid}`);
    return { orderId, orderGuid };
  } catch (err) {
    await transaction.rollback();
    logger.error('Failed to insert SC_Order', err as any);
    throw err;
  }
}

import { Decimal, Int, VarChar } from 'mssql';

import { getPool } from '@/connection/db';
import { logger } from '@/utils/logger';

export interface OrderDetailInputItem {
  productId: string | number; // TireId
  unitPrice: number; // in major currency units (e.g., USD)
  quantity: number; // number of units purchased
}

async function getOrdenNumberByOrderId(orderId: number): Promise<number | null> {
  const pool = await getPool();
  const request = pool.request();
  request.input('orderId', Int, orderId);
  const sql = `SELECT TOP 1 OrdenNumber FROM dbo.SC_Order WHERE Id = @orderId`;
  const result = await request.query(sql);
  const row = result.recordset?.[0] as any;
  const ordenNumber = row?.OrdenNumber;
  const parsed = typeof ordenNumber === 'number' ? ordenNumber : parseInt(String(ordenNumber ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Inserts one SC_OrderDetail row per unit purchased, using OrderId = SC_Order.OrdenNumber.
 * Each inserted row will have Quantity = 1 and Price = unitPrice.
 */
export async function insertOrderDetailsByOrderId(
  scOrderId: number,
  items: OrderDetailInputItem[]
): Promise<{ inserted: number; orderNumber: number | null }> {
  if (!scOrderId || !Array.isArray(items) || items.length === 0) {
    return { inserted: 0, orderNumber: null };
  }

  const orderNumber = await getOrdenNumberByOrderId(scOrderId);
  if (!orderNumber) {
    logger.warn(`SC_Order OrdenNumber not found for Id=${scOrderId}. Skipping SC_OrderDetail insert.`);
    return { inserted: 0, orderNumber: null };
  }

  // Expand to one row per unit (Quantity = 1 per row)
  const rows: Array<{ productId: string; unitPrice: number }> = [];
  for (const it of items) {
    const pid = String(it.productId ?? '').trim();
    const qty = Math.max(0, Math.floor(it.quantity || 0));
    const price = typeof it.unitPrice === 'number' && isFinite(it.unitPrice) ? Number(it.unitPrice.toFixed(2)) : 0;
    if (!pid || qty <= 0 || price < 0) continue;
    for (let i = 0; i < qty; i++) {
      rows.push({ productId: pid, unitPrice: price });
    }
  }

  if (rows.length === 0) return { inserted: 0, orderNumber };

  const pool = await getPool();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const request = transaction.request();
    const statements: string[] = [];

    rows.forEach((r, idx) => {
      const pOrder = `orderId_${idx}`;
      const pProd = `productId_${idx}`;
      const pPrice = `price_${idx}`;
      const pQty = `qty_${idx}`;

      request.input(pOrder, Int, orderNumber);
      request.input(pProd, VarChar(50), r.productId);
      request.input(pPrice, Decimal(18, 2), r.unitPrice);
      request.input(pQty, Int, 1);

      statements.push(
        `INSERT INTO dbo.SC_OrderDetail (OrderId, ProductId, Price, Quantity) VALUES (@${pOrder}, @${pProd}, @${pPrice}, @${pQty})`
      );
    });

    const sql = statements.join(' ;\n');
    await request.query(sql);
    await transaction.commit();

    logger.info(`Inserted ${rows.length} row(s) into SC_OrderDetail for OrdenNumber=${orderNumber}`);
    return { inserted: rows.length, orderNumber };
  } catch (err) {
    await transaction.rollback();
    logger.error('Failed to insert SC_OrderDetail rows', err as any);
    throw err;
  }
}

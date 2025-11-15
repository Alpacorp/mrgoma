import { NextRequest, NextResponse } from 'next/server';

import { insertOrderDetailsByOrderId } from '@/repositories/orderDetailsRepository';
import { insertOrder } from '@/repositories/ordersRepository';
import { fetchTireById, setTiresConditionIdToSoldByIds } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id') || searchParams.get('id');

    if (!sessionId) {
      return badRequest('Missing session_id');
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { message: 'Stripe is not configured on the server.' },
        { status: 501 }
      );
    }

    // Dynamically import Stripe to avoid build-time issues
    // eslint-disable-next-line import/no-unresolved
    const StripeMod = await import('stripe');
    const Stripe = StripeMod.default;
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    } as any);

    const checkoutTestMode = ['true','1','yes','on'].includes(
      String(process.env.CHECKOUT_TEST_MODE || process.env.TEST_MODE || '').toLowerCase()
    );

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId as string);

    // Retrieve line items with expanded product data
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId as string, {
      limit: 100,
      expand: ['data.price.product'],
    });

    // Retrieve payment intent with latest charge for receipt URL, if any
    let receiptUrl: string | null = null;
    let paymentMethodType: string | null = null;
    if (session.payment_intent) {
      const piId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent.id;
      const paymentIntent = await stripe.paymentIntents.retrieve(piId, {
        expand: ['latest_charge'],
      });

      const latestCharge: any = (paymentIntent as any).latest_charge;
      if (latestCharge && typeof latestCharge === 'object') {
        receiptUrl = latestCharge.receipt_url || null;
        if (latestCharge.payment_method_details) {
          // Try to infer a user-friendly payment method label
          const pmd = latestCharge.payment_method_details as any;
          paymentMethodType = pmd.type || (pmd.card ? 'card' : null);
        }
      }
    }

    // Build a safe response object
    const currency = (session.currency || 'usd').toUpperCase();
    const items = (lineItems.data || []).map((li: any) => ({
      id: li.id,
      productId: li.price?.product?.metadata?.productId || li.price?.product?.id || null,
      condition: li.price?.product?.metadata?.condition || null,
      description: li.description || li.price?.product?.name || 'Item',
      quantity: li.quantity || 1,
      amount_subtotal: li.amount_subtotal || 0,
      amount_total: li.amount_total || 0,
      currency: (li.currency || currency).toUpperCase(),
    }));

    // If payment is completed, register an order in SC_Order (do not write to views)
    let updated_sold = 0; // updated to reflect the number of tires updated in dbo.Tires
    let sc_order_id: number | null = null;
    let sc_order_guid: string | null = null;
    let sc_order_store: string | null = null;
    try {
      if ((session.payment_status || '').toLowerCase() === 'paid') {
        // Derive Store from VaultId of the purchased product(s)
        const productIds = Array.from(
          new Set(
            (items.map(it => it.productId).filter(Boolean) as Array<string | number>).map(v =>
              String(v)
            )
          )
        );

        let store = '0';
        if (productIds.length > 0) {
          const vaults: string[] = [];
          for (const pid of productIds) {
            try {
              const rec: any = await fetchTireById(String(pid));
              if (rec && (rec as any).VaultId != null) {
                vaults.push(String((rec as any).VaultId));
              }
            } catch (e) {
              // ignore individual fetch errors and continue
            }
          }
          const uniqueVaults = Array.from(new Set(vaults.filter(Boolean)));
          if (uniqueVaults.length === 1) store = uniqueVaults[0];
          else if (uniqueVaults.length > 1) store = 'MIXED';
        }

        sc_order_store = store;

        if (checkoutTestMode) {
          logger.info('Checkout test mode is enabled: skipping DB writes (SC_Order, SC_OrderDetail, Tires updates).');
        } else {
          // Compute order total in major currency units (decimal)
          const orderTotal = (session.amount_total || 0) / 100;
          const xff = req.headers.get('x-forwarded-for') || '';
          const clientIp = xff.split(',')[0]?.trim() || null;

          const inserted = await insertOrder({
            orderSatusId: 3,
            store,
            orderTotal,
            customerIP: clientIp,
          });
          sc_order_id = inserted.orderId;
          sc_order_guid = inserted.orderGuid;
          logger.info(`Created SC_Order id=${sc_order_id} for session ${sessionId}`);

          // Insert SC_OrderDetail rows: one per tire unit purchased
          try {
            const detailItems = (lineItems.data || [])
              .map((li: any) => {
                const productId =
                  li.price?.product?.metadata?.productId || li.price?.product?.id || null;
                const quantity = li.quantity || 1;
                const unitAmountCents =
                  li.price && (li.price as any).unit_amount != null
                    ? Number((li.price as any).unit_amount)
                    : li.amount_total && quantity
                      ? Math.round(Number(li.amount_total) / Number(quantity))
                      : null;
                const unitPrice = unitAmountCents != null ? Number(unitAmountCents) / 100 : 0;
                return productId
                  ? { productId: String(productId), unitPrice, quantity: Number(quantity) }
                  : null;
              })
              .filter(Boolean) as Array<{ productId: string; unitPrice: number; quantity: number }>;

            if (detailItems.length > 0 && sc_order_id) {
              const res = await insertOrderDetailsByOrderId(sc_order_id, detailItems);
              logger.info(
                `Inserted ${res.inserted} SC_OrderDetail rows for orderId=${sc_order_id} (OrdenNumber=${res.orderNumber ?? 'n/a'})`
              );
            } else {
              logger.warn('No valid line items to insert into SC_OrderDetail');
            }
          } catch (err) {
            logger.error('Failed to insert SC_OrderDetail after payment', err as any);
          }

          // Update Tires.ConditionId to 7 for purchased TireIds
          try {
            if (productIds && productIds.length > 0) {
              const upd = await setTiresConditionIdToSoldByIds(productIds, 7);
              updated_sold = upd.updated;
              logger.info(`Updated dbo.Tires ConditionId=7 for ${updated_sold} tire(s)`);
            }
          } catch (err) {
            logger.error('Failed to update dbo.Tires ConditionId after payment', err as any);
          }
        }
      }
    } catch (err) {
      logger.error('Failed to insert SC_Order after payment', err as any);
      // Do not fail the endpoint; still return the session details
    }

    // Determine shipping total (in cents) from session fields
    const shipping_total_cents =
      (session as any)?.shipping_cost?.amount_total ??
      (session as any)?.total_details?.amount_shipping ??
      0;

    const payload = {
      id: session.id,
      created: session.created ? new Date(session.created * 1000).toISOString() : null,
      customer_email: (session.customer_details as any)?.email || session.customer_email || null,
      payment_status: session.payment_status,
      amount_total: session.amount_total || 0,
      currency,
      receipt_url: receiptUrl,
      payment_method: paymentMethodType,
      items,
      shipping_total: shipping_total_cents,
      updated_sold,
      sc_order_id,
      sc_order_guid,
      store: sc_order_store,
    } as const;

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    console.error('Error fetching Stripe session details:', e);
    const message = e?.message || 'Unexpected server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

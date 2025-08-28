import { NextRequest, NextResponse } from 'next/server';

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

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId as string);

    console.log('logale, session:', session);

    // Retrieve line items with expanded product data
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId as string, {
      limit: 100,
      expand: ['data.price.product'],
    });

    console.log('logale, lineItems:', lineItems);

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

      console.log('logale, paymentIntent:', paymentIntent);

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
      description: li.description || li.price?.product?.name || 'Item',
      quantity: li.quantity || 1,
      amount_subtotal: li.amount_subtotal || 0,
      amount_total: li.amount_total || 0,
      currency: (li.currency || currency).toUpperCase(),
    }));

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
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    console.error('Error fetching Stripe session details:', e);
    const message = e?.message || 'Unexpected server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

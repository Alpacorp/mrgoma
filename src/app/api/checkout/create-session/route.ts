import { NextRequest, NextResponse } from 'next/server';

// Helper to build the application's origin from the request URL
function getOrigin(req: NextRequest) {
  try {
    const url = new URL(req.url);
    return url.origin;
  } catch {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }
}

// Types for request body
interface IncomingItem {
  id: string | number;
  quantity?: number;
}

interface Body {
  items: IncomingItem[];
}

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (process.env.NEXT_PUBLIC_STRIPE_CURRENCY || 'USD').toUpperCase(),
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const origin = getOrigin(req);
    const body = (await req.json()) as Partial<Body> | null;

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { message: 'Invalid payload. Expected { items: [{ id, quantity? }, ...] }' },
        { status: 400 }
      );
    }

    // Validate and normalize items
    const normalized = body.items.map(it => ({
      id: String(it.id),
      quantity: Math.max(1, Math.floor(it.quantity ?? 1)),
    }));

    // Re-validate availability and get authoritative pricing and names
    const unavailable: { id: string; reason: string }[] = [];
    const validated: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      condition?: string | null;
      image?: string | null;
    }[] = [];

    for (const it of normalized) {
      const res = await fetch(`${origin}/api/tire?productId=${encodeURIComponent(it.id)}`, {
        // Avoid caching; we need fresh availability
        cache: 'no-store',
      });

      if (!res.ok) {
        unavailable.push({ id: it.id, reason: `Product not available (status ${res.status})` });
        continue;
      }

      // The tire detail returns a JSON with fields compatible with SingleTire
      const data: any = await res.json().catch(() => null);

      if (!data) {
        unavailable.push({ id: it.id, reason: 'Invalid product data' });
        continue;
      }

      // Validate Condition is not 'sold' (case-insensitive); support both Condition and condition fields
      const conditionVal: string | undefined = data.status;

      if (typeof conditionVal === 'string' && conditionVal.trim().toLowerCase() === 'sold') {
        unavailable.push({ id: it.id, reason: 'Product is already sold' });
        continue;
      }

      // Derive name (inject model if missing) and price from server data
      const baseName: string = (data?.name ?? `Item ${it.id}`).toString();
      const model2: string | undefined =
        data?.model2 || data?.Model2 ? String(data?.model2 || data?.Model2) : undefined;
      let name: string = baseName;
      if (model2) {
        const normBase = baseName.toLowerCase();
        const normModel = model2.toLowerCase();
        if (!normBase.includes(normModel)) {
          // Try to insert model2 into pattern: (CODE) | BRAND | SIZE
          const parts = baseName.split('|').map(p => p.trim());
          if (parts.length === 3 && /^\(.+\)$/.test(parts[0])) {
            // (CODE) | BRAND | SIZE => (CODE) | BRAND | MODEL | SIZE
            name = `${parts[0]} | ${parts[1]} | ${model2} | ${parts[2]}`;
          } else if (parts.length === 2) {
            // BRAND | SIZE => BRAND | MODEL | SIZE
            name = `${parts[0]} | ${model2} | ${parts[1]}`;
          } else {
            // Fallback: append model after brand if we can detect brand, else append at end
            const brand: string | undefined =
              data?.brand || data?.Brand ? String(data?.brand || data?.Brand) : undefined;
            if (brand && normBase.includes(brand.toLowerCase())) {
              name = baseName.replace(brand, `${brand} | ${model2}`);
            } else {
              name = `${baseName} | ${model2}`;
            }
          }
        }
      }
      const priceRaw = data?.price ?? data?.Price;
      const priceNum = typeof priceRaw === 'string' ? parseFloat(priceRaw) : Number(priceRaw);
      const price = Number.isFinite(priceNum) && priceNum > 0 ? priceNum : 0;

      if (price <= 0) {
        unavailable.push({ id: it.id, reason: 'Product has no valid price' });
        continue;
      }

      // Extract product image (first image) and normalize to absolute URL
      const firstImage =
        Array.isArray(data?.images) && data.images.length > 0
          ? data.images[0]?.src || data.images[0]
          : data?.imageSrc || data?.image || null;
      let image: string | null = null;
      if (typeof firstImage === 'string' && firstImage.trim()) {
        const urlStr = firstImage.trim();
        if (/^https?:\/\//i.test(urlStr)) {
          image = urlStr;
        } else if (urlStr.startsWith('/')) {
          image = `${origin}${urlStr}`;
        } else {
          image = `${origin}/${urlStr.replace(/^\.?\//, '')}`;
        }
      }

      validated.push({
        id: it.id,
        name,
        price,
        quantity: it.quantity,
        condition: typeof conditionVal === 'string' ? conditionVal : null,
        image,
      });
    }

    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          message: 'Some products are unavailable. Please review your cart.',
          unavailable,
        },
        { status: 409 }
      );
    }

    // Decide flow based on env switch
    const stripeEnabled = String(process.env.ENABLE_STRIPE_CHECKOUT || '').toLowerCase() === 'true';

    if (!stripeEnabled) {
      // Compose WhatsApp message
      const taxRateRaw = process.env.NEXT_PUBLIC_TAX_RATE
        ? parseFloat(String(process.env.NEXT_PUBLIC_TAX_RATE))
        : 0;
      const taxRate = Number.isFinite(taxRateRaw) && taxRateRaw > 0 ? taxRateRaw : 0;

      const subtotal = validated.reduce((sum, v) => sum + v.price * v.quantity, 0);
      const taxes = subtotal * taxRate;
      const total = subtotal + taxes;

      const lines: string[] = [];
      lines.push(`New order from the website`);
      lines.push(`Date: ${new Date().toLocaleString('en-US')}`);
      lines.push('');
      lines.push('Products:');
      validated.forEach(v => {
        const lineTotal = v.price * v.quantity;
        lines.push(`• ${v.name} (ID: ${v.id}) x ${v.quantity} — ${formatCurrency(lineTotal)}`);
      });
      lines.push('');
      lines.push(`Subtotal: ${formatCurrency(subtotal)}`);
      if (taxRate > 0) {
        lines.push(`Taxes (${Math.round(taxRate * 100)}%): ${formatCurrency(taxes)}`);
      }
      lines.push(`Total: ${formatCurrency(total)}`);
      lines.push('');
      lines.push('Please confirm availability and preferred payment method.');

      const number = (
        process.env.WHATSAPP_NUMBER ||
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
        '573222202887'
      ).replace(/[^0-9]/g, '');
      const text = encodeURIComponent(lines.join('\n'));
      const whatsappUrl = `https://wa.me/${number}?text=${text}`;

      return NextResponse.json({ whatsappUrl }, { status: 200 });
    }

    // Ensure Stripe is configured
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        {
          message:
            'Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment to enable payments.',
        },
        { status: 501 }
      );
    }

    // Dynamically import stripe to avoid build-time dependency issues
    // eslint-disable-next-line import/no-unresolved
    const StripeMod = await import('stripe');
    const Stripe = StripeMod.default;
    const stripe = new Stripe(secretKey, {
      // Pin to a recent API version; update as needed
      apiVersion: '2024-11-20.acacia',
    } as any);

    // Build line items with authoritative data
    const line_items = validated.map(v => ({
      price_data: {
        currency: (process.env.NEXT_PUBLIC_STRIPE_CURRENCY || 'usd').toLowerCase(),
        product_data: {
          name: v.name,
          images: v.image ? [v.image] : undefined,
          metadata: {
            productId: v.id,
            condition: (v.condition || '').toString(),
          },
        },
        unit_amount: Math.round(v.price * 100), // cents
      },
      quantity: v.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      phone_number_collection: {
        enabled: true,
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      // Free shipping option (amount = 0)
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: (process.env.NEXT_PUBLIC_STRIPE_CURRENCY || 'usd').toLowerCase(),
            },
            display_name: 'Free shipping',
          },
        },
      ],
      automatic_tax: {
        enabled: true,
      },
      line_items,
      success_url: `${origin}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json({ message: 'Failed to create checkout session.' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    console.error('Error creating checkout session:', e);
    return NextResponse.json({ message: e?.message || 'Unexpected server error' }, { status: 500 });
  }
}

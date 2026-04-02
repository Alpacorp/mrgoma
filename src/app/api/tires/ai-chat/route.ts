import { NextRequest, NextResponse } from 'next/server';

import Anthropic from '@anthropic-ai/sdk';

import { fetchTiresServer } from '@/app/(shop)/tires/utils/fetchTiresServer';
import { logger } from '@/utils/logger';

const SPANISH_PATTERN =
  /\b(llantas?|llanta|medida|medidas|marca|marcas|busco|quiero|tienen|tienes|necesito|precio|precios|nueva|nuevas|usada|usadas|aro|ancho|perfil|hola|gracias|por favor|disponible|disponibles|cuánto|cuanto|dónde|donde|están|hay|puedes|puede|cómo|como)\b/i;

function isSpanish(messages: { role: string; content: string }[]): boolean {
  const recentText = messages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content)
    .join(' ');
  return SPANISH_PATTERN.test(recentText);
}

function buildNoResultsMessage(spanish: boolean, filterParams: Record<string, unknown>): string {
  const w = filterParams.w;
  const s = filterParams.s;
  const d = filterParams.d;
  const sizeStr = w && s && d ? ` ${w}/${s}R${d}` : '';
  const waText = spanish
    ? `Hola, busco llantas${sizeStr} y no encontré disponibilidad en el sitio web.`
    : `Hi, I'm looking for tires${sizeStr} and didn't find availability on the website.`;
  const waUrl = `https://wa.me/14073644016?text=${encodeURIComponent(waText)}`;

  if (spanish) {
    return (
      `No tenemos llantas${sizeStr} disponibles en este momento en nuestro inventario en línea 😔\n\n` +
      `Nuestro inventario se actualiza constantemente — es posible que tengamos lo que necesitas en tienda. ` +
      `Te recomendamos contactarnos directamente para una confirmación rápida:\n\n` +
      `💬 [Escribir por WhatsApp](${waUrl})`
    );
  }

  return (
    `We don't have tires${sizeStr} available in our online inventory right now 😔\n\n` +
    `Our inventory updates constantly — we may have what you need in store. ` +
    `We recommend reaching out directly for a quick confirmation:\n\n` +
    `💬 [Chat on WhatsApp](${waUrl})`
  );
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a fast, clear, and friendly tire assistant for MrGoma Tires, a tire shop with locations in Miami and Orlando, Florida, USA.
Your goal is to help customers quickly find tires and guide them to call or visit the nearest store.
You are NOT a replacement for store staff — always direct the customer toward calling or visiting.

## LANGUAGE
Detect the customer's language automatically and always respond in that same language.
- If English → respond in English
- If Spanish → respond in Spanish
- If unclear → ask: "English or Español?"

Spanish tire terms: "llantas/cauchos/neumáticos" = tires, "aro" = rim diameter, "usadas" = used, "nuevas" = new, "parcheadas" = patched, "banda de rodamiento" = tread, "perfil" = aspect ratio

## CONVERSATION FLOW
1. Detect language
2. Ask what the customer needs
3. If tires: ask for size (e.g., 225/45R17) or vehicle (year, make, model)
4. Ask which area/store is closest to them
5. Show the store card (see format below)
6. Suggest calling or visiting the store

## STORE CARD FORMAT
When showing store info, always use this format:

---
📍 **[Store Name]**
[Address]
🕒 [Hours]
📞 [Phone]

🗺️ [View on Google Maps]([maps link])
📞 [Call the store](tel:[digits only])
---

Only add the WhatsApp link when applicable (see WHATSAPP section below).

## STORE LOCATIONS

**MrGoma Tires – Miami South (US-1)**
Address: 18200 S Dixie Hwy, Miami, FL 33157
Phone: (305) 278-4632
Hours: Mon–Fri: 8:00 AM–6:00 PM | Sat: 8:00 AM–5:00 PM | Sun: 9:00 AM–4:00 PM
Maps: https://share.google/AipDvyYSOOaPaRo3d
Areas served: Cutler Bay, Palmetto Bay, South Miami, Kendall, Pinecrest

**MrGoma Tires – Miami North (441)**
Address: 20282 NW 2nd Ave, Miami Gardens, FL 33169
Phone: (305) 770-1154
Hours: Mon–Fri: 8:00 AM–6:00 PM | Sat: 8:00 AM–5:00 PM | Sun: 9:00 AM–4:00 PM
Maps: https://share.google/n4H7vi26TlDNpM9AK
Areas served: Miami Gardens, Hollywood, Aventura, Miramar, Miami Beach

**MrGoma Tires – Miami Airport (27th)**
Address: 3251 NW 27th Ave, Miami, FL 33142
Phone: (786) 703-4807
Hours: Mon–Fri: 8:00 AM–6:00 PM | Sat: 8:00 AM–5:00 PM | Sun: Closed
Maps: https://share.google/dRDJw8IvmSXhYbKrV
Areas served: Allapattah, Midtown, Near Miami Int'l Airport

**MrGoma Tires – Miami Coral Gables**
Address: 900 S Le Jeune Rd, Coral Gables, Miami, FL 33134
Phone: (305) 713-1258
Hours: Mon–Fri: 8:00 AM–6:00 PM | Sat: 8:00 AM–5:00 PM | Sun: 9:00 AM–4:00 PM
Maps: https://share.google/81G3k6XuPKmxsDwvk
Areas served: Coral Gables, Westchester, Near Miami Int'l Airport

**MrGoma Tires – Miami Hialeah**
Address: 4040 E 10th Ct, Hialeah, FL 33013
Phone: (305) 836-4200
Hours: Mon–Fri: 8:00 AM–6:00 PM | Sat: 8:00 AM–5:00 PM | Sun: Closed
Maps: https://share.google/GVeqM5QWQdWtzOrE4
Areas served: Hialeah, Miami Springs, East Hialeah

**MrGoma Tires – Orlando West Colonial**
Address: 4400 W Colonial Dr, Orlando, FL 32808
Phone: (407) 203-3912
Hours: Mon–Fri: 8:00 AM–6:00 PM | Sat: 8:00 AM–5:00 PM | Sun: 9:00 AM–4:00 PM
Maps: https://share.google/12Hfr8er8CV21t1lf
Areas served: Midtown, Winter Garden, West Orlando

**MrGoma Tires – Orlando Semoran**
Address: 575 N Semoran Blvd, Orlando, FL 32807
Phone: (407) 282-3100
Hours: Mon–Fri: 8:00 AM–6:00 PM | Sat: 8:00 AM–5:00 PM | Sun: Closed
Maps: https://share.google/MivYzOzp64pwprNXf
Areas served: Azalea Park, Winter Park, East Orlando, Near Orlando Int'l Airport

## Q&A BASE RESPONSES
Use these as your base tone and phrasing. Adapt naturally to the conversation.

TIRES:
EN: "What size are you looking for? (example: 225/45R17) or tell me your car (year, make, model)."
ES: "¿Qué medida buscas? (ejemplo: 225/45R17) o dime tu carro (año, marca y modelo)."

AVAILABILITY:
EN: "We receive new inventory daily 🔥 I can help you search here or guide you to your nearest store for fastest confirmation."
ES: "Recibimos inventario nuevo todos los días 🔥 Puedo ayudarte aquí o guiarte a tu tienda más cercana para confirmación rápida."

PRICE:
EN: "Prices depend on size, brand, and condition. I can guide you or help you contact your nearest store for exact pricing."
ES: "Los precios dependen de la medida, marca y condición. Puedo orientarte o ayudarte a contactar tu tienda más cercana."

SERVICES:
EN: "We offer mount & balance, alignment, oil change, flat repair, brakes, and diagnostics."
ES: "Ofrecemos montaje y balanceo, alineación, cambio de aceite, reparación de llantas, frenos y diagnóstico."

LOCATION:
EN: "Which MrGoma location works best for you? I'll guide you to the closest store."
ES: "¿Qué ubicación de MrGoma te queda mejor? Te ayudo a encontrar la más cercana."

HOURS – TODAY:
EN: "Hours may vary by location. I recommend calling the store directly for the fastest confirmation 👍 Which location are you visiting?"
ES: "El horario puede variar según la tienda. Te recomiendo llamar a la tienda directamente para confirmarlo rápido 👍 ¿Qué ubicación necesitas?"

HOURS – GENERAL:
EN: "Hours depend on the location. Which store are you visiting?"
ES: "El horario depende de la tienda. ¿Qué ubicación necesitas?"

HOLIDAYS:
EN: "Holiday hours may vary. The best way is to call the store directly to confirm 👍 Which location do you need?"
ES: "El horario en días feriados puede variar. Lo más rápido es llamar a la tienda para confirmarlo 👍 ¿Qué ubicación necesitas?"

SPEAK TO SOMEONE:
EN: "I can guide you to your nearest store or help you contact them by phone for faster assistance 👍"
ES: "Te puedo guiar a tu tienda más cercana o ayudarte a contactarlos por teléfono para atención más rápida 👍"

FALLBACK (unknown question):
EN: "I may not have the exact answer here, but I can help guide you or connect you to a store for quick assistance 👍"
ES: "Puede que no tenga la respuesta exacta aquí, pero te puedo ayudar o conectarte con una tienda para atención rápida 👍"

## WHATSAPP
WhatsApp number: +1 (407) 364-4016

Use WhatsApp ONLY in these three cases:
1. The tire the customer needs is not found in the inventory search results
2. The customer needs more personalized help
3. The customer explicitly asks to speak to someone

When applicable, generate a pre-filled WhatsApp link using this format:
https://wa.me/14073644016?text=[URL-encoded message]

Pre-filled message format:
EN: "Hi, I need help with tires for the [STORE NAME] store. My size is [SIZE]."
ES: "Hola, necesito ayuda con llantas para la tienda de [STORE NAME]. Mi medida es [SIZE]."

Show it as: 💬 [Chat on WhatsApp](https://wa.me/14073644016?text=...)

## INVENTORY SEARCH
When the customer wants to search the inventory, use the apply_filters tool.
Tire size format: width/profile/diameter (e.g., "225/45R17" or "225/45/17" → w=225, s=45, d=17)
"Aro 17" or "rim 17" = diameter 17. "Ancho 225" = width 225.
Prices are in USD.
When the customer asks about a specific vehicle, suggest the standard tire size for that vehicle and offer to search for it.
When the customer refines a previous search ("only new ones", "just Michelin"), combine with the existing conversation context.

## OUT OF SCOPE
Do not answer questions unrelated to tires, vehicles, or MrGoma services.
EN redirect: "I'm here to help with tires and MrGoma services. Is there anything tire-related I can help you with?"
ES redirect: "Estoy aquí para ayudarte con llantas y servicios de MrGoma. ¿Hay algo relacionado con llantas en lo que pueda ayudarte?"
Do not share internal business information (employee details, cost prices, margins, supplier info).
Never guarantee exact prices or specific inventory availability.`;

const APPLY_FILTERS_TOOL: Anthropic.Tool = {
  name: 'apply_filters',
  description:
    'Search the tire inventory by applying filters based on what the customer is looking for. Call this when the customer wants to find or browse tires.',
  input_schema: {
    type: 'object' as const,
    properties: {
      w: {
        type: 'number',
        description: 'Tire width in mm (e.g., 205)',
      },
      s: {
        type: 'number',
        description: 'Tire aspect ratio / profile as a percentage (e.g., 55)',
      },
      d: {
        type: 'number',
        description: 'Rim diameter in inches (e.g., 16)',
      },
      minPrice: {
        type: 'number',
        description: 'Minimum price in USD',
      },
      maxPrice: {
        type: 'number',
        description: 'Maximum price in USD',
      },
      minTreadDepth: {
        type: 'number',
        description: 'Minimum tread depth in mm',
      },
      maxTreadDepth: {
        type: 'number',
        description: 'Maximum tread depth in mm',
      },
      minRemainingLife: {
        type: 'number',
        description: 'Minimum remaining life percentage (0-100)',
      },
      maxRemainingLife: {
        type: 'number',
        description: 'Maximum remaining life percentage (0-100)',
      },
      condition: {
        type: 'string',
        enum: ['new', 'used'],
        description: 'Tire condition: "new" or "used"',
      },
      patched: {
        type: 'boolean',
        description: 'Whether the tire has been patched',
      },
      brands: {
        type: 'string',
        description: 'Comma-separated list of tire brands (e.g., "Michelin,Bridgestone")',
      },
      stores: {
        type: 'string',
        description: 'Comma-separated list of store/branch names to filter by location',
      },
      confirmationMessage: {
        type: 'string',
        description:
          'Required. A friendly confirmation message in the same language the customer used, summarizing what is being searched.',
      },
    },
    required: ['confirmationMessage'],
  },
};

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages }: { messages: ApiMessage[] } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { message: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [APPLY_FILTERS_TOOL],
      messages: messages,
    });

    const toolUseBlock = response.content.find(block => block.type === 'tool_use');

    if (toolUseBlock && toolUseBlock.type === 'tool_use') {
      const filters = toolUseBlock.input as Record<string, unknown>;
      const { confirmationMessage, ...filterParams } = filters;

      // Build URL params from filter values to check inventory count
      const paramRecord: Record<string, string> = {};
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) paramRecord[key] = String(value);
      });

      const { totalCount } = await fetchTiresServer(paramRecord);

      if (totalCount === 0) {
        return NextResponse.json({
          type: 'message',
          message: buildNoResultsMessage(isSpanish(messages), filterParams),
        });
      }

      return NextResponse.json({
        type: 'filters',
        filters: filterParams,
        message: confirmationMessage as string,
      });
    }

    const textBlock = response.content.find(block => block.type === 'text');
    const message =
      textBlock && textBlock.type === 'text'
        ? textBlock.text
        : 'I can help you find the right tires. Ask me about sizes, brands, or conditions!';

    return NextResponse.json({
      type: 'message',
      message,
    });
  } catch (err: unknown) {
    logger.error('Failed to process customer AI chat request', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

import Anthropic from '@anthropic-ai/sdk';

import { logger } from '@/utils/logger';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a friendly and knowledgeable tire assistant for Mr. Goma Tires, a tire shop serving customers in Florida, USA.
Your job is to help customers find the right tires and answer their questions about tires.

## What you CAN help with

**Inventory search:** When customers want to find or filter tires, use the apply_filters tool to search the available inventory.

**General tire education (answer these without using the tool):**
- Tire size explained: what does "205/55/16" mean (width/aspect ratio/diameter)
- Differences between new and used tires (cost, warranty, expected life, risk)
- Tread depth: what it means, minimum safe depth (2/32"), how to measure it
- Remaining life percentage: how it's estimated
- Tire brands: general characteristics of Michelin, Bridgestone, Goodyear, Continental, Pirelli, Hankook, Kumho, etc.
- When to replace tires (age, wear indicators, damage)
- Tire types: all-season, summer, winter, performance, all-terrain
- Reading tire sidewall markings (load index, speed rating, DOT code)
- General car-to-tire size recommendations (if customer mentions their vehicle model, suggest the standard tire size and offer to search for it)
- Patched tires: what it means, safety considerations, typical price difference
- Inflation, rotation, alignment basics

**Language:** Respond in the same language the customer uses. Spanish and English are both fully supported.
Spanish tire terms: "llantas/cauchos/neumáticos" = tires, "aro" = rim diameter, "usadas" = used, "nuevas" = new, "parcheadas" = patched, "banda de rodamiento" = tread, "perfil" = aspect ratio

## What you CANNOT help with

- Topics completely unrelated to tires or vehicles (food, politics, sports scores, math problems, etc.)
- Internal business information (employee details, cost prices, margins, supplier contracts)
- Specific guarantees about inventory availability (inventory changes constantly)
- Legal or medical advice

If asked about something outside your scope, politely redirect the customer to tire-related topics.

## Search context

When the customer wants to search the inventory, use the apply_filters tool.
Tire size format: width/profile/diameter (e.g., "205/55/16" → w=205, s=55, d=16).
Price context: prices are in USD.
"Aro 16" or "rim 16" = diameter 16. "Ancho 205" = width 205.

When the customer asks about a specific vehicle (e.g., "Honda Civic 2018"), you can use your knowledge to suggest the standard tire size and then apply those filters.

When the customer refines a search ("only Michelin ones", "cheaper ones"), combine with the existing conversation context.`;

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

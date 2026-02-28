import { NextRequest, NextResponse } from 'next/server';

import Anthropic from '@anthropic-ai/sdk';

import { logger } from '@/utils/logger';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an inventory assistant for Mr. Goma Tires, a tire shop in Colombia.
Your ONLY job is to help the sales team search and filter the tire inventory.

STRICT SCOPE RULE: You must ONLY respond to questions related to tires, tire inventory, brands, sizes, prices, or conditions. If the user asks about anything else (math, general knowledge, current events, personal questions, etc.), politely refuse and redirect them to ask about tires. Do not answer off-topic questions under any circumstances.

When the user asks about tires or inventory, extract the relevant filter criteria and use the apply_filters tool.
When the user greets you or asks a tire-related question that doesn't need filters (e.g., "what brands do you have?"), respond with a helpful plain text message without using the tool.

Tire size format in Colombia: width/profile/diameter (e.g., "205/55/16" means width=205, profile=55, diameter=16)
Common abbreviations: "llantas" = tires, "usadas" = used, "nuevas" = new, "parcheadas" = patched
Price context: prices are in Colombian pesos (COP). "150 mil" = 150000, "medio millón" = 500000

When the user refines a previous search (e.g., "only new ones", "just Michelin"), combine with the existing context from the conversation.`;

const APPLY_FILTERS_TOOL: Anthropic.Tool = {
  name: 'apply_filters',
  description:
    'Apply inventory filters based on the user query. Call this when the user is asking to search or filter tires.',
  input_schema: {
    type: 'object' as const,
    properties: {
      w: {
        type: 'number',
        description: 'Tire width in mm (e.g., 205)',
      },
      s: {
        type: 'number',
        description: 'Tire profile/series as a percentage (e.g., 55)',
      },
      d: {
        type: 'number',
        description: 'Rim diameter in inches (e.g., 16)',
      },
      minPrice: {
        type: 'number',
        description: 'Minimum price in COP',
      },
      maxPrice: {
        type: 'number',
        description: 'Maximum price in COP',
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
      confirmationMessage: {
        type: 'string',
        description:
          'Required. A short confirmation message in the same language the user used, describing what filters are being applied.',
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

    // Check if Claude used the apply_filters tool
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

    // Plain text response (no tool use)
    const textBlock = response.content.find(block => block.type === 'text');
    const message =
      textBlock && textBlock.type === 'text'
        ? textBlock.text
        : 'I can help you search for tires. Try asking about a specific size, brand, or condition.';

    return NextResponse.json({
      type: 'message',
      message,
    });
  } catch (err: unknown) {
    logger.error('Failed to process AI chat request', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

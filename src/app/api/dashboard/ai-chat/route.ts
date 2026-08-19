import { NextRequest, NextResponse } from 'next/server';

import Anthropic from '@anthropic-ai/sdk';

import { dimensionsParam } from '@/app/api/_lib/aiChat/dimensions';
import { withLogging } from '@/app/api/_lib/withLogging';
import { auth } from '@/app/utils/authOptions';
import { fetchDashboardLocations, fetchDashboardStores } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';
import { createRateLimiter } from '@/utils/rateLimit';

const isRateLimited = createRateLimiter('ai-chat', { windowMs: 60 * 1000, max: 20 });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an inventory assistant for Mr. Goma Tires, a tire shop in Miami, Florida, USA.
Your ONLY job is to help the sales team search and filter the tire inventory.

STRICT SCOPE RULE: You must ONLY respond to questions related to tires, tire inventory, brands, sizes, prices, or conditions. If the user asks about anything else (math, general knowledge, current events, personal questions, etc.), politely refuse and redirect them to ask about tires. Do not answer off-topic questions under any circumstances.

When the user asks about tires or inventory, extract the relevant filter criteria and use the apply_filters tool.
When the user greets you or asks a tire-related question that doesn't need filters (e.g., "what brands do you have?"), respond with a helpful plain text message without using the tool.

Tire size format in Colombia: width/profile/diameter (e.g., "205/55/16" means width=205, profile=55, diameter=16)
Common abbreviations: "llantas" = tires, "usadas" = used, "nuevas" = new, "parcheadas" = patched, "kindSale" / "kind sale" = KindSale filter (yes/no), "local" / "locales" = Local filter (yes = local tires, no = non-local tires)
Store/branch: tires belong to a store (called "sucursal" or "tienda" in Spanish). Use the stores filter with the exact store name the user mentions (e.g., "sucursal norte" → stores="sucursal norte").
Shelf location: within a store, each tire sits on a shelf identified by a short code such as "+703C+", "-507D-", "{IN}" or ":410D:" (called "ubicación", "estante" or "posición" in Spanish). Use the locations filter, giving each code together with its store.
NEVER invent a shelf code, and never add or remove the symbols around one. Real codes are decorated (=653A=, "663A", +703C+, {IN}) and people say only the middle part. Pass exactly the text the user gave you — the server matches it against the codes that store really holds, so "653A" finds "=653A=" on its own. Adding your own decoration breaks that match.
A shelf code without a store is not a filter: the same code exists in several stores. If the user names a code but no store, ask which store they mean instead of using the tool.
Price context: prices in the database are in USD. Apply price filters directly using the USD amounts the user mentions.
Tire code: each tire has a unique numeric code (called "código" or "code"). When the user mentions a specific code number, use the code filter (e.g., "busca el código 12345" → code="12345").

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
        description:
          'Comma-separated list of store/branch names to filter by (e.g., "Sucursal Norte,Sucursal Sur")',
      },
      locations: {
        type: 'array',
        description:
          'Shelf locations to filter by. Each entry pairs a shelf code with the store that holds it, because the same code exists in more than one store. Only use codes the user typed — never invent one.',
        items: {
          type: 'object',
          properties: {
            store: { type: 'string', description: 'The store that holds this shelf' },
            code: { type: 'string', description: 'The shelf code exactly as the user typed it' },
          },
          required: ['store', 'code'],
        },
      },
      kindSale: {
        type: 'string',
        enum: ['yes', 'no'],
        description:
          'Filter by KindSale field: "yes" for tires marked as kind sale, "no" for regular tires.',
      },
      local: {
        type: 'string',
        enum: ['yes', 'no'],
        description:
          'Filter by Local field: "yes" to show only local tires, "no" to show only non-local tires.',
      },
      sort: {
        type: 'string',
        enum: ['price-asc', 'price-desc'],
        description:
          'Result ordering. "price-asc" for cheapest first, "price-desc" for most expensive first. These are the only two orderings the catalog supports.',
      },
      code: {
        type: 'string',
        description:
          'Exact numeric tire code to search for (e.g., "12345"). Only digits are valid.',
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

/**
 * Turns what the user *said* into shelf codes that exist.
 *
 * Real codes are decorated — `=653A=`, `"663A"`, `+703C+`, `{IN}` — and nobody
 * says the decoration out loud. Asked for "653A" the assistant passes `653A`,
 * which matches nothing, and the table comes back empty looking like missing
 * stock rather than a near miss. The dropdown has never had this problem because
 * its type-to-filter input matches on substring; this gives the chat the same
 * resolution.
 *
 * Exact matches win. Otherwise every code in that store containing the text is
 * taken — the same rule the input uses — and the store name is matched
 * case-insensitively, because "clifton" is what people type.
 *
 * **This is the one place this route touches the catalogue.** Everywhere else it
 * deliberately does not (see the note by the tool response), so the cost is one
 * scoped lookup on the only filter whose values cannot be guessed.
 */
const MAX_RESOLVED_CODES = 25;

async function resolveLocations(
  raw: unknown
): Promise<{ store: string; code: string }[] | undefined> {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;

  const asked = raw.filter(
    (entry): entry is { store: string; code: string } =>
      !!entry &&
      typeof entry === 'object' &&
      typeof (entry as { store?: unknown }).store === 'string' &&
      typeof (entry as { code?: unknown }).code === 'string'
  );
  if (asked.length === 0) return undefined;

  const knownStores = await fetchDashboardStores();
  const storeOf = (name: string) =>
    knownStores.find(store => store.toLowerCase() === name.trim().toLowerCase());

  const stores = [...new Set(asked.map(pair => storeOf(pair.store)).filter(Boolean))] as string[];
  if (stores.length === 0) return undefined;

  const real = await fetchDashboardLocations(stores);
  const seen = new Set<string>();
  const resolved: { store: string; code: string }[] = [];

  const take = (pair: { store: string; code: string }) => {
    const key = `${pair.store}\u0000${pair.code}`;
    if (seen.has(key)) return;
    seen.add(key);
    resolved.push(pair);
  };

  for (const pair of asked) {
    const store = storeOf(pair.store);
    if (!store) continue;

    const inStore = real.filter(candidate => candidate.store === store);
    const exact = inStore.find(candidate => candidate.code === pair.code);
    if (exact) {
      take(exact);
      continue;
    }

    const needle = pair.code.trim().toLowerCase();
    if (!needle) continue;
    for (const candidate of inStore) {
      if (candidate.code.toLowerCase().includes(needle)) take(candidate);
    }
  }

  if (resolved.length === 0) return undefined;

  if (resolved.length > MAX_RESOLVED_CODES) {
    // Not silent: a request this broad is worth seeing in the logs rather than
    // quietly becoming a URL with hundreds of pairs in it.
    logger.warn(
      `Shelf lookup matched ${resolved.length} codes; using the first ${MAX_RESOLVED_CODES}`
    );
    return resolved.slice(0, MAX_RESOLVED_CODES);
  }

  return resolved;
}

export const POST = withLogging('dashboard.aiChat.POST', async (req: NextRequest) => {
  if (isRateLimited(req)) {
    return NextResponse.json(
      { message: 'Too many requests. Try again in a moment.' },
      { status: 429 }
    );
  }

  const session = await auth();

  if (!session) {
    logger.warn('Unauthorized access');
    return NextResponse.json({ message: 'Unauthorized user. Please log in.' }, { status: 401 });
  }

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

      // Shelf codes are the one filter whose values cannot be guessed, so what
      // the assistant produced is resolved against what the store actually holds.
      if ('locations' in filterParams) {
        const resolved = await resolveLocations(filterParams.locations);
        if (resolved) filterParams.locations = resolved;
        else delete filterParams.locations;
      }

      return NextResponse.json({
        type: 'filters',
        filters: filterParams,
        message: confirmationMessage as string,
        // No `no_results` counterpart here on purpose: this route never queries
        // the catalogue, so it cannot know a search came back empty. Giving it
        // one would mean a database round-trip for a staff tool that does not
        // want the customer-facing WhatsApp fallback either.
        dimensions: dimensionsParam(filterParams),
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
});

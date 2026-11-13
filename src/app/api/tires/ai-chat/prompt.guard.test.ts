import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Guard against the prompt contradicting itself.
 *
 * On 2026-08-06 the conversation flow was rewritten to search on a partial
 * filter, and asking for "michelin" still produced "What size are you looking
 * for? (example: 225/45R17)" — because a canned Q&A template further down still
 * scripted exactly that, word for word, and the model followed the more concrete
 * instruction.
 *
 * The route tests could not catch it. They stub the model's tool call, so they
 * verify what the route does *given* a search, never whether the model decides
 * to search. Nothing short of a live call proves that, and a live call in CI is
 * neither cheap nor deterministic.
 *
 * What *is* checkable is the instruction set: that the overriding rule is
 * present, and that the size-question template is explicitly fenced. That is a
 * narrow guard — it cannot prove the model complies — but it would have failed
 * on the exact mistake that shipped.
 */
const PROMPT = readFileSync(join(process.cwd(), 'src/app/api/tires/ai-chat/route.ts'), 'utf8');

describe('the assistant is told to search before asking', () => {
  it('states the overriding rule', () => {
    expect(PROMPT).toContain('RULE ZERO');
    expect(PROMPT).toMatch(/apply_filters\s+tool IMMEDIATELY/);
  });

  it('places that rule before the templates it overrides', () => {
    // A model weights what it reads first, and the contradiction lived below.
    expect(PROMPT.indexOf('RULE ZERO')).toBeLessThan(PROMPT.indexOf('Q&A BASE RESPONSES'));
  });

  it('fences the size-question template instead of offering it unconditionally', () => {
    // The template itself is fine — for someone who gave nothing to search on.
    const tiresEntry = PROMPT.slice(PROMPT.indexOf('TIRES'), PROMPT.indexOf('AVAILABILITY'));

    expect(tiresEntry).toMatch(/ONLY when the customer gave nothing searchable/);
  });

  it('names the partial filters that must not trigger a question', () => {
    expect(PROMPT).toMatch(/"michelin" alone/i);
    expect(PROMPT).toMatch(/"aro 17" alone/i);
  });
});

describe('asking for WhatsApp is not a reason to be interrogated', () => {
  /**
   * The same defect, one section further down and older than this feature: the
   * pre-filled message template demanded a store and a size, so asking for
   * WhatsApp produced two questions before the link. Whoever types "WhatsApp"
   * has already decided to talk to a person — they have the least patience left
   * of anyone in the conversation.
   */
  const section = PROMPT.slice(
    PROMPT.indexOf('## WHATSAPP'),
    PROMPT.indexOf('## INVENTORY SEARCH')
  );

  it('forbids collecting details just to fill the template', () => {
    expect(section).toMatch(/NEVER ask for a size or a store just to fill this in/);
  });

  it('offers a form of the message that needs nothing', () => {
    expect(section).toContain('Hi, I need help with tires.');
    expect(section).toContain('Hola, necesito ayuda con llantas.');
  });
});

describe('tire sets come from the app, not the model (044)', () => {
  const section = PROMPT.slice(PROMPT.indexOf('## TIRE SETS'), PROMPT.indexOf('## OUT OF SCOPE'));

  it('sends set requests with a size to find_sets', () => {
    expect(section).toMatch(/call the find_sets tool IMMEDIATELY/);
    expect(section).toMatch(/without asking for a city, store, brand or condition first/);
    expect(section).toMatch(/with no number means 4/);
  });

  it('names find_sets in RULE ZERO, before the flow that asks for a store', () => {
    // On 2026-11-10 "necesito 4 llantas 315/30/22" got "which city?" instead of
    // sets: the flow's "ask which store" step won over the sets section below it.
    const rule = PROMPT.slice(PROMPT.indexOf('RULE ZERO'), PROMPT.indexOf('## LANGUAGE'));
    expect(rule).toMatch(/call the find_sets tool IMMEDIATELY/);
  });

  it('forbids the model from stating prices, counts or availability of sets', () => {
    expect(section).toMatch(/Do NOT write set prices, counts, treads or availability yourself/);
  });

  it('never states the old one-city rule (047, D1, D2)', () => {
    expect(PROMPT).not.toMatch(/same city|store's city|only in (Miami|Orlando)/i);
    expect(section).toMatch(/A set may mix tires from Miami and Orlando/);
    expect(section).toMatch(/pick up at any of our stores/);
  });

  it('says the chat cannot add to the cart and nothing is reserved (AC10)', () => {
    expect(section).toMatch(/You cannot add anything to the cart and nothing is reserved/);
  });
});

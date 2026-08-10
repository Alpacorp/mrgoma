import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

/**
 * Both surfaces render this same component. Until 2026-08-06 they emitted
 * identical events with nothing to tell them apart, so every search a seller ran
 * from `/dashboard` counted alongside a customer's and the funnel we steer by
 * described the two mixed together.
 *
 * `InteractionTracker` forwards any `data-track-*` attribute as an event
 * property, so the whole fix is this attribute reaching the DOM — no change to
 * the tracking machinery, which is what feature 015's single choke point was
 * for.
 */
beforeAll(() => {
  process.env.NEXT_PUBLIC_AI_CHAT_ENABLED = 'true';
});

const launcher = () => screen.getByRole('button', { name: /open ai assistant/i });

describe('the surface an event came from', () => {
  it('labels the public assistant', async () => {
    const { default: AiChat } = await import('./AiChat');
    render(<AiChat surface="site" />);

    expect(launcher()).toHaveAttribute('data-track-surface', 'site');
  });

  it('labels the internal one differently', async () => {
    const { default: AiChat } = await import('./AiChat');
    render(<AiChat surface="dashboard" />);

    expect(launcher()).toHaveAttribute('data-track-surface', 'dashboard');
  });

  it('rides along with the event name, not instead of it', async () => {
    const { default: AiChat } = await import('./AiChat');
    render(<AiChat surface="site" />);

    expect(launcher()).toHaveAttribute('data-track', 'open_ai_chat');
    expect(launcher()).toHaveAttribute('data-track-category', 'ai_chat');
  });
});

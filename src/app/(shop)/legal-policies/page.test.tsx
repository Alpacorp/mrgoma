import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LegalPoliciesPage from './page';

/**
 * The privacy policy has to name every analytics tool the site runs and say
 * which of them starts before consent is given (feature 015, FR19).
 *
 * This is asserted rather than left to review because the disclosure is what
 * makes running an ungated analytics tool defensible: the tool is exempt from
 * the cookie-consent requirement precisely because it stores nothing on the
 * visitor's device, but it is never exempt from being disclosed. If someone
 * later trims this copy, the failure should be loud.
 */
describe('legal policies — analytics disclosure', () => {
  it('names both analytics tools', () => {
    render(<LegalPoliciesPage />);

    expect(screen.getByText('Google Analytics')).toBeInTheDocument();
    expect(screen.getByText('Vercel Web Analytics')).toBeInTheDocument();
  });

  it('says which tool waits for consent and which does not', () => {
    const { container } = render(<LegalPoliciesPage />);
    const text = container.textContent ?? '';

    expect(text).toMatch(/runs only after you accept cookies/i);
    expect(text).toMatch(/stores nothing on your device/i);
    expect(text).toMatch(/runs on every visit/i);
  });

  it('states that neither tool receives personal details', () => {
    const { container } = render(<LegalPoliciesPage />);

    expect(container.textContent ?? '').toMatch(
      /neither tool receives your name, email address, phone number, or postal address/i
    );
  });
});

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PricingProvider } from './pricingConfig';

describe('PricingProvider', () => {
  it('does not render catalog fallback prices before the current price book loads', () => {
    const html = renderToStaticMarkup(
      <PricingProvider><span>Retatrutide $9</span></PricingProvider>,
    );

    expect(html).toContain('Loading current prices');
    expect(html).not.toContain('Retatrutide $9');
  });
});

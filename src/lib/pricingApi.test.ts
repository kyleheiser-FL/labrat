import { describe, expect, it, vi } from 'vitest';
import { fetchCustomerPriceBook } from './pricingApi';

describe('fetchCustomerPriceBook', () => {
  it('loads current customer prices for a signed-out visitor', async () => {
    const request = vi.fn(async () => new Response(JSON.stringify({
      priceBook: { 'Retatrutide (5mg)': { chnVial: 49 } },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const result = await fetchCustomerPriceBook(null, [], request);

    expect(result['Retatrutide (5mg)'].chnVial).toBe(49);
    expect(request).toHaveBeenCalledWith('/api/prices', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
  });
});

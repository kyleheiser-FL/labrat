import { describe, expect, it } from 'vitest';
import { getPricingRequestKey } from './pricingAccess';

describe('getPricingRequestKey', () => {
  it('allows public catalog visitors to load customer prices', () => {
    expect(getPricingRequestKey(null, '203.0.113.7')).toBe('prices_ip_203.0.113.7');
  });

  it('rate limits signed-in customers by uid', () => {
    expect(getPricingRequestKey({ uid: 'member-123' }, '203.0.113.7')).toBe('prices_member-123');
  });
});

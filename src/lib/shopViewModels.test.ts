import { describe, expect, it } from 'vitest';
import {
  getOrderProgress,
  getOrderStatusViewModel,
  getShopTierViewModel,
} from './shopViewModels';

describe('shop view models', () => {
  it('describes every customer as the same per-vial free-shipping experience', () => {
    const tier = getShopTierViewModel({ isChinaVialPricing: true });

    expect(tier.title).toBe('Member Store');
    expect(tier.badge).toBe('Per-Vial Rate');
    expect(tier.priceBasis).toContain('individual research vial');
    expect(tier.shippingPromise).toBe('Free shipping on every order');
    expect(tier.tone).toBe('emerald');
  });

  it('normalizes order status into member-facing next steps', () => {
    const status = getOrderStatusViewModel('processing');

    expect(status.label).toBe('Processing');
    expect(status.nextStep).toContain('packing');
    expect(status.toneClassName).toContain('blue');
  });

  it('maps cancelled orders to zero progress', () => {
    expect(getOrderProgress('cancelled')).toEqual([
      { label: 'Invoice', active: false },
      { label: 'Processing', active: false },
      { label: 'Shipped', active: false },
      { label: 'Delivered', active: false },
    ]);
  });
});

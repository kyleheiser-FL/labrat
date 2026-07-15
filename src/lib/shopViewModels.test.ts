import { describe, expect, it } from 'vitest';
import {
  getOrderProgress,
  getOrderStatusViewModel,
  getShopTierViewModel,
} from './shopViewModels';

describe('shop view models', () => {
  it('describes Norway kit member pricing as a kit-rate experience', () => {
    const tier = getShopTierViewModel({ isKitPricing: true });

    expect(tier.title).toBe('Norway Kit Member');
    expect(tier.badge).toBe('Kit Rate');
    expect(tier.priceBasis).toContain('10-vial kit');
    expect(tier.shippingPromise).toContain('$30');
    expect(tier.tone).toBe('cyan');
  });

  it('describes China vial member pricing as a per-vial free-shipping experience', () => {
    const tier = getShopTierViewModel({ isChinaVialPricing: true });

    expect(tier.title).toBe('China Vial Member');
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

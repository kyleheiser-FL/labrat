export type ShopTierTone = 'cyan' | 'emerald' | 'red' | 'slate';

export interface ShopTierViewModel {
  title: string;
  badge: string;
  priceBasis: string;
  shippingPromise: string;
  trustLine: string;
  sourceLine: string;
  tone: ShopTierTone;
  iconToneClassName: string;
  panelClassName: string;
}

export interface ShopTierFlags {
  isViewingAsAdmin?: boolean;
  isKitPricing?: boolean;
  isChinaKitPricing?: boolean;
  isChinaVialPricing?: boolean;
  isApprovedVialPricing?: boolean;
}

export interface OrderStatusViewModel {
  label: string;
  nextStep: string;
  toneClassName: string;
}

export interface OrderProgressStep {
  label: string;
  active: boolean;
}

const tierStyles: Record<ShopTierTone, Pick<ShopTierViewModel, 'iconToneClassName' | 'panelClassName'>> = {
  cyan: {
    iconToneClassName: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25',
    panelClassName: 'border-cyan-500/25 bg-cyan-500/5',
  },
  emerald: {
    iconToneClassName: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
    panelClassName: 'border-emerald-500/25 bg-emerald-500/5',
  },
  red: {
    iconToneClassName: 'text-red-300 bg-red-500/10 border-red-500/25',
    panelClassName: 'border-red-500/25 bg-red-500/5',
  },
  slate: {
    iconToneClassName: 'text-slate-300 bg-slate-500/10 border-slate-500/25',
    panelClassName: 'border-slate-700/80 bg-slate-900/40',
  },
};

function withTone(
  tone: ShopTierTone,
  tier: Omit<ShopTierViewModel, 'tone' | 'iconToneClassName' | 'panelClassName'>
): ShopTierViewModel {
  return {
    ...tier,
    tone,
    ...tierStyles[tone],
  };
}

export function getShopTierViewModel(flags: ShopTierFlags = {}): ShopTierViewModel {
  if (flags.isViewingAsAdmin) {
    return withTone('red', {
      title: 'Admin Storefront Preview',
      badge: 'Operations View',
      priceBasis: 'Customer-facing pricing with admin controls visible',
      shippingPromise: 'Fulfillment and margin tools are available',
      trustLine: 'Preview the same catalog and pricing every customer sees.',
      sourceLine: 'Active customer catalog',
    });
  }

  return withTone('emerald', {
    title: 'Member Store',
    badge: 'Per-Vial Rate',
    priceBasis: 'Prices are shown per individual research vial',
    shippingPromise: 'Free shipping on every order',
    trustLine: 'COA-backed catalog with request-based manual invoicing.',
    sourceLine: 'Active customer catalog',
  });
}

export function getOrderStatusViewModel(status = 'placed'): OrderStatusViewModel {
  switch (status) {
    case 'processing':
      return {
        label: 'Processing',
        nextStep: 'Payment is verified and the order is in packing for dispatch.',
        toneClassName: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
      };
    case 'shipped':
      return {
        label: 'Shipped',
        nextStep: 'Tracking is active and the shipment is moving through the carrier network.',
        toneClassName: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20',
      };
    case 'completed':
      return {
        label: 'Delivered',
        nextStep: 'Delivery has been completed and the order is closed.',
        toneClassName: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        nextStep: 'This request has been cancelled and will not be dispatched.',
        toneClassName: 'bg-red-500/15 text-red-300 border border-red-500/20',
      };
    case 'placed':
    default:
      return {
        label: 'Invoice Pending',
        nextStep: 'The request is received and awaiting manual invoice confirmation.',
        toneClassName: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
      };
  }
}

export function getOrderProgress(status = 'placed'): OrderProgressStep[] {
  const stepOrder = ['placed', 'processing', 'shipped', 'completed'];
  const activeIndex = status === 'cancelled' ? -1 : stepOrder.indexOf(status);

  return [
    { label: 'Invoice', active: activeIndex >= 0 },
    { label: 'Processing', active: activeIndex >= 1 },
    { label: 'Shipped', active: activeIndex >= 2 },
    { label: 'Delivered', active: activeIndex >= 3 },
  ];
}

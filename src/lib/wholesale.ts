import { auth } from '../firebase';

// Raw wholesale costs — fetched from the admin-only /api/wholesale endpoint.
// norW = Norway kit cost, usW = China US-warehouse kit cost, chnW = China kit cost.
export type WholesaleBook = Record<string, { norW: number; usW: number; chnW: number }>;

export async function fetchWholesaleBook(names: string[] = []): Promise<WholesaleBook> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not signed in');
  const res = await fetch('/api/wholesale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ names }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Server error ${res.status}`);
  }
  return (await res.json()).wholesaleBook || {};
}

// Estimated landed cost per vial: Norway kit cost / 10 + flat shipping share.
// Falls back to 45% of base price when the product isn't in the wholesale book.
export function getProductCostPerVial(name: string, basePrice: number, book?: WholesaleBook): number {
  const kitCost = book?.[name]?.norW || Math.round(basePrice * 0.45 * 10);
  const baseCostPerVial = kitCost / 10;
  const shippingChargePerVial = 3.50;
  return Number((baseCostPerVial + shippingChargePerVial).toFixed(2));
}

export function getChinaVialCost(name: string, book?: WholesaleBook): number {
  const e = book?.[name];
  if (!e) return 0;
  if (e.usW) return e.usW / 10;
  return e.chnW ? e.chnW / 10 : 0;
}

export function getChineseKitWholesaleCost(name: string, book?: WholesaleBook): number {
  return book?.[name]?.chnW || 0;
}

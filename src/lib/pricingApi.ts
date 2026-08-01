import type { ProductPrices } from './pricingConfig';

interface PricingUser {
  getIdToken(): Promise<string>;
}

export async function fetchCustomerPriceBook(
  user: PricingUser | null,
  names: string[],
  request: typeof fetch = fetch,
): Promise<Record<string, ProductPrices>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (user) headers.Authorization = `Bearer ${await user.getIdToken()}`;

  const response = await request('/api/prices', {
    method: 'POST',
    headers,
    body: JSON.stringify({ names }),
  });
  if (!response.ok) throw new Error(`Server error ${response.status}`);
  const data = await response.json();
  return data.priceBook || {};
}

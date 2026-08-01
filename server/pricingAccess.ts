export interface PricingCaller {
  uid: string;
}

export function getPricingRequestKey(caller: PricingCaller | null, ip: string): string {
  return caller?.uid ? `prices_${caller.uid}` : `prices_ip_${ip || 'unknown'}`;
}

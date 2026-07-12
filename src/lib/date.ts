// The app operates on New York (US Eastern) time regardless of the device's
// timezone, so a user's day, dose dates, and log times are consistent whether
// they're travelling or their phone clock is off. Intl with an IANA zone
// applies Eastern DST (EDT/EST) automatically.
export const APP_TIME_ZONE = 'America/New_York';

// Local (New-York) calendar date as YYYY-MM-DD.
//
// Do NOT use `new Date().toISOString().split('T')[0]` for a "what day is it"
// value: toISOString() returns UTC, so an evening Eastern timestamp rolls to
// the next calendar day and mis-dates late-night dose logs.
export function localDateISO(d: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

// New-York wall-clock time as HH:MM (24h) — for stamping dose logs.
export function localTimeHM(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIME_ZONE,
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(d);
}

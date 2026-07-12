// Local calendar date as YYYY-MM-DD.
//
// Do NOT use `new Date().toISOString().split('T')[0]` for a "what day is it"
// value: toISOString() returns UTC, so an evening timestamp in a negative-UTC
// timezone (e.g. 10:57 PM US Eastern) rolls to the *next* calendar day. That
// mis-dated late-night dose logs (they showed up under the wrong day). Deriving
// the date from local Date components keeps the stored date aligned with the
// local time shown next to it.
export function localDateISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

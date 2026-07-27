type Data = Record<string, unknown>

export function sanitizeCompounds(rows: Data[]) {
  return rows.filter((row) => !row.isCompleted).map((row) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? 'Compound'),
    type: String(row.type ?? 'compound'),
    doseAmount: Number(row.doseAmount ?? 0),
    doseUnit: String(row.doseUnit ?? ''),
    frequency: String(row.frequency ?? ''),
    customDays: row.customDays == null ? null : Number(row.customDays),
    scheduledDays: Array.isArray(row.scheduledDays) ? row.scheduledDays : [],
    reminderTime: row.reminderTime ? String(row.reminderTime) : null,
    startDate: row.startDate ? String(row.startDate) : null,
    durationWeeks: Number(row.durationWeeks ?? 0),
  }))
}

export function sanitizeDoseLogs(rows: Data[]) {
  return rows.slice(0, 30).map((row) => ({
    id: String(row.id ?? ''),
    compoundId: String(row.compoundId ?? ''),
    compoundName: String(row.compoundName ?? 'Compound'),
    date: String(row.date ?? ''),
    time: String(row.time ?? ''),
    doseAmount: Number(row.doseAmount ?? 0),
    doseUnit: String(row.doseUnit ?? ''),
    isSkipped: Boolean(row.isSkipped),
  }))
}

import { describe, expect, it } from 'vitest'
import { sanitizeCompounds, sanitizeDoseLogs } from './pipContext'

describe('Pip LabRat context', () => {
  it('keeps schedules but omits private notes', () => {
    const compounds = sanitizeCompounds([{
      id: 'bpc', name: 'BPC-157', type: 'peptide', doseAmount: 250,
      doseUnit: 'mcg', frequency: 'daily', reminderTime: '08:00',
      notes: 'private note',
    }])
    expect(compounds[0]).toMatchObject({
      name: 'BPC-157', doseAmount: 250, reminderTime: '08:00',
    })
    expect(JSON.stringify(compounds)).not.toContain('private note')
  })

  it('limits recent dose history and omits notes', () => {
    const rows = Array.from({ length: 40 }, (_, index) => ({
      id: String(index), compoundId: 'bpc', compoundName: 'BPC-157',
      date: '2026-07-27', time: '08:00', doseAmount: 250,
      doseUnit: 'mcg', notes: 'private',
    }))
    const logs = sanitizeDoseLogs(rows)
    expect(logs).toHaveLength(30)
    expect(JSON.stringify(logs)).not.toContain('private')
  })
})

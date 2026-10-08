// One place for turning values into CSV, shared by the data export and the analytics export.

// Text typed into a public form ends up in these cells, and spreadsheets treat
// a cell beginning with = + - @ as a formula, so someone could submit a
// "message" that runs when an admin opens the CSV. Prefix those with an
// apostrophe, but leave plain phone numbers / numbers alone (a number like
// +44 7700 900123 is not a formula, and mangling it would be annoying).
export function csvCell(value: unknown): string {
  let s = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (/^[=+\-@\t\r]/.test(s) && !/^[+-]?[\d\s().-]+$/.test(s)) s = `'${s}`
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** A whole CSV file as a download. A leading BOM makes Excel read it as UTF-8, so names and accents stay intact. */
export function csvResponse(filename: string, header: unknown[], rows: unknown[][]): Response {
  const lines = [header.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))]
  return new Response(`﻿${lines.join('\r\n')}\r\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

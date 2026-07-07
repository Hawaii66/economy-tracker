export type ParsedCsvRow = {
  date: string
  amount: number
  description: string
  rawRow: Record<string, string>
}

export type CsvParseResult = {
  rows: ParsedCsvRow[]
  skippedRowCount: number
  delimiter: string
  columnMapping: {
    date: string
    amount: string
    description: string
  }
}

const DATE_COLUMN_PATTERNS = [
  /^datum$/i,
  /^date$/i,
  /^bokf[oö]ringsdag$/i,
  /^bokf[oö]rd$/i,
  /^transaktionsdatum$/i,
]

const AMOUNT_COLUMN_PATTERNS = [
  /^belopp$/i,
  /^amount$/i,
  /^summa$/i,
]

const DESCRIPTION_COLUMN_PATTERNS = [
  /^text$/i,
  /^beskrivning$/i,
  /^description$/i,
  /^meddelande$/i,
  /^mottagare$/i,
  /^referens$/i,
]

export async function readCsvText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const utf8 = new TextDecoder('utf-8').decode(buffer)
  if (utf8.includes('\uFFFD')) {
    return new TextDecoder('iso-8859-1').decode(buffer)
  }
  return utf8
}

function detectDelimiter(firstLine: string): string {
  const semicolons = (firstLine.match(/;/g) ?? []).length
  const commas = (firstLine.match(/,/g) ?? []).length
  return semicolons >= commas ? ';' : ','
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

function findColumn(headers: string[], patterns: RegExp[]): string | null {
  for (const header of headers) {
    if (patterns.some((pattern) => pattern.test(header.trim()))) {
      return header
    }
  }
  return null
}

function parseAmount(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  let normalized = trimmed.replace(/\s/g, '')
  const hasComma = normalized.includes(',')
  const hasDot = normalized.includes('.')

  if (hasComma && hasDot) {
    if (normalized.lastIndexOf(',') > normalized.lastIndexOf('.')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.')
    } else {
      normalized = normalized.replace(/,/g, '')
    }
  } else if (hasComma) {
    normalized = normalized.replace(',', '.')
  }

  const amount = Number.parseFloat(normalized)
  return Number.isFinite(amount) ? amount : null
}

function parseDate(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed)
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
  }

  const europeanMatch = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/.exec(trimmed)
  if (europeanMatch) {
    const day = europeanMatch[1].padStart(2, '0')
    const month = europeanMatch[2].padStart(2, '0')
    return `${europeanMatch[3]}-${month}-${day}`
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  return null
}

export function parseCsvText(text: string): CsvParseResult {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one transaction row.')
  }

  const delimiter = detectDelimiter(lines[0])
  const headers = parseCsvLine(lines[0], delimiter)

  const dateColumn = findColumn(headers, DATE_COLUMN_PATTERNS) ?? headers[0]
  const amountColumn = findColumn(headers, AMOUNT_COLUMN_PATTERNS) ?? headers[1] ?? headers[0]
  const descriptionColumn =
    findColumn(headers, DESCRIPTION_COLUMN_PATTERNS) ?? headers[2] ?? headers[1] ?? headers[0]

  const rows: ParsedCsvRow[] = []
  let skippedRowCount = 0

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line, delimiter)
    const rawRow = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))

    const date = parseDate(rawRow[dateColumn] ?? '')
    const amount = parseAmount(rawRow[amountColumn] ?? '')
    const description = (rawRow[descriptionColumn] ?? '').trim()

    if (!date || amount === null) {
      skippedRowCount += 1
      continue
    }

    rows.push({
      date,
      amount,
      description,
      rawRow,
    })
  }

  if (rows.length === 0) {
    throw new Error('No valid transaction rows were found in this CSV file.')
  }

  return {
    rows,
    skippedRowCount,
    delimiter,
    columnMapping: {
      date: dateColumn,
      amount: amountColumn,
      description: descriptionColumn,
    },
  }
}

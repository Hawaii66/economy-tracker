import {
  formatMinorUnits,
  minorUnitsToDecimalString,
  parseDecimalStringToMinorUnits,
} from 'budget-core'

export { minorUnitsToDecimalString, parseDecimalStringToMinorUnits }

/** Format stored minor units (öre) for display. */
export function formatMoney(minorUnits: number, currency = 'SEK'): string {
  return formatMinorUnits(minorUnits, currency)
}

import { z } from "zod";

/** Minor currency units per major unit (öre per SEK). */
export const MINOR_UNITS_PER_MAJOR_UNIT = 100 as const;

/** Money stored as integer minor currency units (öre for SEK). */
export const MoneyAmountSchema = z.number().int();
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;

export function wholeMajorUnitsToMinorUnits(wholeMajorUnits: number): number {
  return wholeMajorUnits * MINOR_UNITS_PER_MAJOR_UNIT;
}

export function parseDecimalStringToMinorUnits(
  value: string,
  minorUnitsPerMajor = MINOR_UNITS_PER_MAJOR_UNIT,
): number | null {
  let trimmed = value.trim().replace(/\s/g, "");
  if (!trimmed) {
    return null;
  }

  let negative = false;
  if (trimmed.startsWith("-")) {
    negative = true;
    trimmed = trimmed.slice(1);
  } else if (trimmed.startsWith("+")) {
    trimmed = trimmed.slice(1);
  }

  if (!trimmed) {
    return null;
  }

  let majorPart: string;
  let minorPart: string;

  const lastComma = trimmed.lastIndexOf(",");
  const lastDot = trimmed.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      majorPart = trimmed.slice(0, lastComma).replace(/\./g, "");
      minorPart = trimmed.slice(lastComma + 1);
    } else {
      majorPart = trimmed.slice(0, lastDot).replace(/,/g, "");
      minorPart = trimmed.slice(lastDot + 1);
    }
  } else if (lastComma !== -1) {
    majorPart = trimmed.slice(0, lastComma);
    minorPart = trimmed.slice(lastComma + 1);
  } else if (lastDot !== -1) {
    majorPart = trimmed.slice(0, lastDot);
    minorPart = trimmed.slice(lastDot + 1);
  } else {
    majorPart = trimmed;
    minorPart = "";
  }

  if (!/^\d+$/.test(majorPart) || (minorPart && !/^\d+$/.test(minorPart))) {
    return null;
  }

  const minorDigits = Math.log10(minorUnitsPerMajor);
  if (!Number.isInteger(minorDigits)) {
    throw new Error("minorUnitsPerMajor must be a power of 10");
  }

  const paddedMinor = (minorPart + "0".repeat(minorDigits)).slice(0, minorDigits);
  const major = Number(majorPart);
  const minor = paddedMinor.length > 0 ? Number(paddedMinor) : 0;

  if (!Number.isSafeInteger(major) || !Number.isSafeInteger(minor)) {
    return null;
  }

  const total = major * minorUnitsPerMajor + minor;
  return negative ? -total : total;
}

export function minorUnitsToDecimalString(minorUnits: number): string {
  const negative = minorUnits < 0;
  const abs = Math.abs(minorUnits);
  const major = Math.floor(abs / MINOR_UNITS_PER_MAJOR_UNIT);
  const minor = abs % MINOR_UNITS_PER_MAJOR_UNIT;
  const text = `${major},${String(minor).padStart(2, "0")}`;
  return negative ? `-${text}` : text;
}

export function formatMinorUnits(
  minorUnits: number,
  currency = "SEK",
  locale = "sv-SE",
): string {
  const negative = minorUnits < 0;
  const abs = Math.abs(minorUnits);
  const major = Math.floor(abs / MINOR_UNITS_PER_MAJOR_UNIT);
  const minor = abs % MINOR_UNITS_PER_MAJOR_UNIT;
  const decimalValue = Number(
    `${negative ? "-" : ""}${major}.${String(minor).padStart(2, "0")}`,
  );

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    signDisplay: "exceptZero",
  }).format(decimalValue);
}

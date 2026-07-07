import { z } from "zod";

export const CURRENT_STATE_VERSION = 1 as const;
export const CURRENT_EVENT_VERSION = 1 as const;

export const EntityIdSchema = z.string().min(1);
export type EntityId = z.infer<typeof EntityIdSchema>;

export const IsoDateSchema = z.string().date();
export type IsoDate = z.infer<typeof IsoDateSchema>;

export const IsoDateTimeSchema = z.string().datetime();
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

export const CurrencyCodeSchema = z
  .string()
  .length(3)
  .transform((value) => value.toUpperCase());
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

export { MoneyAmountSchema, type MoneyAmount } from "./money.ts";

export const HexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
  .default("#5EAEFF");
export type HexColor = z.infer<typeof HexColorSchema>;

export const DEFAULT_ENTITY_COLOR = "#5EAEFF" as const;

export const ACCOUNT_ICON_VALUES = [
  "wallet",
  "landmark",
  "credit-card",
  "piggy-bank",
  "banknote",
  "building-2",
  "circle-dollar-sign",
] as const;

export const AccountIconSchema = z.enum(ACCOUNT_ICON_VALUES);
export type AccountIcon = z.infer<typeof AccountIconSchema>;

export const DEFAULT_ACCOUNT_ICON = "wallet" as const;

export const MembershipRoleSchema = z.enum(["OWNER", "EDITOR", "VIEWER"]);
export type MembershipRole = z.infer<typeof MembershipRoleSchema>;

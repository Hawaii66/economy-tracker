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

export const MoneyAmountSchema = z.number().finite();
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;

export const HexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
  .default("#5EAEFF");
export type HexColor = z.infer<typeof HexColorSchema>;

export const DEFAULT_ENTITY_COLOR = "#5EAEFF" as const;

export const MembershipRoleSchema = z.enum(["OWNER", "EDITOR", "VIEWER"]);
export type MembershipRole = z.infer<typeof MembershipRoleSchema>;

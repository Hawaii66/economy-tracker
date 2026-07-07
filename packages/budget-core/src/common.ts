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

export const SINK_ICON_VALUES = [
  "house",
  "car",
  "fuel",
  "utensils",
  "shopping-cart",
  "plane",
  "palmtree",
  "heart-pulse",
  "graduation-cap",
  "baby",
  "shirt",
  "zap",
  "shield",
  "gift",
  "dog",
  "dumbbell",
  "tv",
  "wrench",
  "smartphone",
  "tree-pine",
  "briefcase",
  "calendar",
  "coffee",
  "target",
  "stethoscope",
  "book-open",
  "gamepad-2",
  "music",
  "bus",
  "bike",
  "hammer",
  "paintbrush",
  "flower-2",
  "scissors",
  "receipt",
  "umbrella",
] as const;

export type SinkIcon = (typeof SINK_ICON_VALUES)[number];

export const DEFAULT_SINK_ICON: SinkIcon = "target";

const LEGACY_ACCOUNT_ICON_TO_SINK_ICON: Record<string, SinkIcon> = {
  wallet: "target",
  landmark: "briefcase",
  "credit-card": "smartphone",
  "piggy-bank": "target",
  banknote: "shopping-cart",
  "building-2": "house",
  "circle-dollar-sign": "target",
};

export function normalizeSinkIcon(value: unknown): SinkIcon {
  if (
    typeof value === "string" &&
    (SINK_ICON_VALUES as readonly string[]).includes(value)
  ) {
    return value as SinkIcon;
  }

  if (typeof value === "string" && value in LEGACY_ACCOUNT_ICON_TO_SINK_ICON) {
    return LEGACY_ACCOUNT_ICON_TO_SINK_ICON[value]!;
  }

  return DEFAULT_SINK_ICON;
}

export const SinkIconSchema = z.preprocess(
  (value) => normalizeSinkIcon(value),
  z.enum(SINK_ICON_VALUES),
);

export const MembershipRoleSchema = z.enum(["OWNER", "EDITOR", "VIEWER"]);
export type MembershipRole = z.infer<typeof MembershipRoleSchema>;

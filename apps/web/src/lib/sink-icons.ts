import {
  DEFAULT_SINK_ICON,
  SINK_ICON_VALUES,
  type SinkIcon,
} from 'budget-core'

export { DEFAULT_SINK_ICON, SINK_ICON_VALUES, type SinkIcon }

export const SINK_ICON_OPTIONS = [
  { value: 'house' as const, label: 'Home' },
  { value: 'car' as const, label: 'Car' },
  { value: 'fuel' as const, label: 'Fuel' },
  { value: 'bus' as const, label: 'Transit' },
  { value: 'bike' as const, label: 'Cycling' },
  { value: 'utensils' as const, label: 'Dining' },
  { value: 'shopping-cart' as const, label: 'Groceries' },
  { value: 'coffee' as const, label: 'Coffee & snacks' },
  { value: 'plane' as const, label: 'Travel' },
  { value: 'palmtree' as const, label: 'Vacation' },
  { value: 'heart-pulse' as const, label: 'Health' },
  { value: 'stethoscope' as const, label: 'Medical' },
  { value: 'graduation-cap' as const, label: 'Education' },
  { value: 'book-open' as const, label: 'Books' },
  { value: 'baby' as const, label: 'Family' },
  { value: 'shirt' as const, label: 'Clothing' },
  { value: 'scissors' as const, label: 'Personal care' },
  { value: 'zap' as const, label: 'Utilities' },
  { value: 'shield' as const, label: 'Insurance' },
  { value: 'umbrella' as const, label: 'Emergency fund' },
  { value: 'gift' as const, label: 'Gifts' },
  { value: 'dog' as const, label: 'Pets' },
  { value: 'dumbbell' as const, label: 'Fitness' },
  { value: 'tv' as const, label: 'Entertainment' },
  { value: 'gamepad-2' as const, label: 'Gaming' },
  { value: 'music' as const, label: 'Music' },
  { value: 'wrench' as const, label: 'Repairs' },
  { value: 'hammer' as const, label: 'Home improvement' },
  { value: 'paintbrush' as const, label: 'DIY & decor' },
  { value: 'smartphone' as const, label: 'Phone & tech' },
  { value: 'tree-pine' as const, label: 'Hobbies' },
  { value: 'flower-2' as const, label: 'Garden' },
  { value: 'briefcase' as const, label: 'Work' },
  { value: 'calendar' as const, label: 'Bills' },
  { value: 'receipt' as const, label: 'Expenses' },
  { value: 'target' as const, label: 'Savings goal' },
] satisfies ReadonlyArray<{ value: SinkIcon; label: string }>

export function sinkIconLabel(icon: SinkIcon): string {
  return SINK_ICON_OPTIONS.find((option) => option.value === icon)?.label ?? icon
}

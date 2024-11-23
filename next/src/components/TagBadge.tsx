import { Tag as TagIcon } from "lucide-react";
import { Tag } from "../../types/tag";
import { Badge, BadgeProps } from "./ui/badge";
import { OptionalChildren } from "../../types/children";
import { cn } from "@/lib/utils";

type Props = {
  tag: Pick<Tag, "name" | "color">;
} & BadgeProps;

export default function TagBadge({
  tag,
  children,
  ...rest
}: Props & OptionalChildren) {
  return (
    <Badge
      {...rest}
      style={{ backgroundColor: tag.color }}
      className={cn("gap-2 px-2", rest.className)}
    >
      <TagIcon size={12} /> {tag.name}
      {children}
    </Badge>
  );
}

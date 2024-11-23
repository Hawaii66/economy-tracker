import { Tag as TagIcon } from "lucide-react";
import { Tag } from "../../types/tag";
import { Badge } from "./ui/badge";

type Props = {
  tag: Pick<Tag, "name" | "color">;
};

export default function TagBadge({ tag }: Props) {
  return (
    <Badge className="gap-2 px-2" style={{ backgroundColor: tag.color }}>
      <TagIcon size={16} /> {tag.name}
    </Badge>
  );
}

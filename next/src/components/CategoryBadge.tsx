import { Folder } from "lucide-react";
import { Category } from "../../types/category";
import { Badge } from "./ui/badge";

type Props = {
  category: Pick<Category, "name" | "color">;
};

export default function CategoryBadge({ category }: Props) {
  return (
    <Badge className="gap-2 px-2" style={{ backgroundColor: category.color }}>
      <Folder size={16} /> {category.name}
    </Badge>
  );
}

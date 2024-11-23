import { DBTag } from "../../types/Database";
import { Tag } from "../../types/tag";

export const DBTagToTag = (db: DBTag) => {
  const tag: Tag = {
    color: db.color,
    description: db.description,
    name: db.name,
    id: db.id,
  };

  return Tag.parse(tag);
};

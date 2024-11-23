import { Category } from "../../types/category";
import { DBCategory } from "../../types/Database";

export const DBCategoryToCategory = (db: DBCategory): Category => {
  const category: Category = {
    color: db.color,
    description: db.description,
    id: db.id,
    name: db.name,
  };

  return Category.parse(category);
};

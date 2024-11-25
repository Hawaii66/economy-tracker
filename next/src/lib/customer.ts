import { Customer } from "../../types/customer";
import { DBCategory, DBCustomer } from "../../types/Database";

export const DBCustomerToCustomer = (
  db: Pick<DBCustomer, "id" | "name" | "rename" | "category_id" | "type"> &
    Pick<DBCategory, "color" | "description" | "expected_per_month"> & {
      catagoryName: string;
    }
): Customer => {
  return {
    id: db.id,
    name: db.name,
    rename: db.rename,
    type: db.type,
    category: {
      color: db.color,
      description: db.description,
      id: db.category_id,
      name: db.catagoryName,
      expectedPerMonth: db.expected_per_month,
    },
  };
};

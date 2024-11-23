import { z } from "zod";
import { Tag } from "./tag";

export const Category = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  color: z.string(),
});
export type Category = z.infer<typeof Category>;

export const CategoryWithTags = Category.extend({
  tags: Tag.array(),
});
export type CategoryWithTags = z.infer<typeof CategoryWithTags>;

export const CustomerTypeMap = {
  company: "company",
  personal: "personal",
};
export const CustomerType = z.enum([
  CustomerTypeMap.personal,
  CustomerTypeMap.company,
]);
export type CustomerType = z.infer<typeof CustomerType>;

import { CustomerType } from "./category";

export type DBCategory = {
  id: string;
  created_at: Date;
  name: string;
  description: string;
  color: string;
  user_id: string;
};

export type DBTag = {
  id: string;
  created_at: Date;
  name: string;
  description: string;
  color: string;
  user_id: string;
};

export type DBCategoryTag = {
  id: string;
  created_at: Date;
  category_id: string;
  tag_id: string;
};

export type DBCustomer = {
  id: string;
  created_at: Date;
  name: string;
  category_id: string;
  rename: string;
  type: CustomerType;
};

export type DBTransaction = {
  id: string;
  created_at: Date;
  date: Date;
  verification_number: string;
  customer_id: string | null;
  amount: number;
  text: string;
};

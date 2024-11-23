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

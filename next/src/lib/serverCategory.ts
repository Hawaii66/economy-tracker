"use server";

import { revalidatePath } from "next/cache";
import { Category } from "../../types/category";
import { db } from "./db";
import { DEFAULT_USER_ID } from "./dangerous";
import { DBCategory } from "../../types/Database";
import { DBCategoryToCategory } from "./cateogory";

export const getCategories = async () => {
  const sql = await db();
  const categories = await sql.query<DBCategory>("SELECT * FROM categories");
  await sql.end();

  return categories.rows.map(DBCategoryToCategory);
};

export const onEditCategory = async (
  id: Category["id"],
  toUpdate: Pick<Category, "name" | "description" | "color">
) => {
  const sql = await db();
  await sql.query(
    `
		  UPDATE
			  categories
		  SET
			  name=$1,
			  description=$2,
			  color=$3
		  WHERE
			  id=$4
		  `,
    [toUpdate.name, toUpdate.description, toUpdate.color, id]
  );
  await sql.end();
  revalidatePath("/categories");
};

export const onCreateCategory = async (
  toCreate: Pick<Category, "name" | "description" | "color">
) => {
  const sql = await db();
  await sql.query(
    `
			INSERT INTO
				categories
				(name,description,color,user_id)
			VALUES
				($1,$2,$3,$4)
			`,
    [toCreate.name, toCreate.description, toCreate.color, DEFAULT_USER_ID]
  );
  await sql.end();
  revalidatePath("/categories");
};

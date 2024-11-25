"use server";

import { Category, CategoryWithTags } from "../../types/category";
import { db } from "./db";
import { DEFAULT_USER_ID } from "./dangerous";
import { DBCategory, DBCategoryTag } from "../../types/Database";
import { DBCategoryToCategory } from "./cateogory";
import { Tag } from "../../types/tag";
import { getTags } from "./serverTag";
import { revalidateAll } from "./paths";

export const getCategories = async (): Promise<CategoryWithTags[]> => {
  const sql = await db();
  const categories = await sql.query<DBCategory>("SELECT * FROM categories");
  await sql.end();

  const tags = await getTags();
  const tagConnections = await getTagConnections(
    categories.rows.map((i) => i.id)
  );

  return categories.rows.map((category) => {
    const categoryTags = tagConnections
      .filter((i) => i.categoryId === category.id)
      .map((i) => i.tagId);
    return {
      ...DBCategoryToCategory(category),
      tags: tags.filter((i) => categoryTags.includes(i.id)),
    };
  });
};

export const onEditCategory = async (
  id: Category["id"],
  toUpdate: Pick<
    Category,
    "name" | "description" | "color" | "expectedPerMonth"
  >
) => {
  const sql = await db();
  await sql.query(
    `
		  UPDATE
			  categories
		  SET
			  name=$1,
			  description=$2,
			  color=$3,
			  expected_per_month=$4
		  WHERE
			  id=$5
		  `,
    [
      toUpdate.name,
      toUpdate.description,
      toUpdate.color,
      toUpdate.expectedPerMonth,
      id,
    ]
  );
  await sql.end();
  revalidateAll();
};

export const onCreateCategory = async (
  toCreate: Pick<
    Category,
    "name" | "description" | "color" | "expectedPerMonth"
  >
) => {
  const sql = await db();
  await sql.query(
    `
			INSERT INTO
				categories
				(name,description,color,user_id,expected_per_month)
			VALUES
				($1,$2,$3,$4,$5)
			`,
    [
      toCreate.name,
      toCreate.description,
      toCreate.color,
      DEFAULT_USER_ID,
      toCreate.expectedPerMonth,
    ]
  );
  await sql.end();
  revalidateAll();
};

export const getTagConnections = async (ids: Category["id"][]) => {
  const sql = await db();
  const tags = await sql.query<Pick<DBCategoryTag, "tag_id" | "category_id">>(
    `
		SELECT
			tag_id,
			category_id
		FROM
			category_tags
		WHERE
			category_id=ANY($1)
		`,
    [ids]
  );
  await sql.end();

  return tags.rows.map((i) => ({
    categoryId: i.category_id,
    tagId: i.tag_id,
  }));
};

export const onAddTag = async (id: Category["id"], tagId: Tag["id"]) => {
  const sql = await db();
  await sql.query(
    `
			  INSERT INTO
				category_tags
				(category_id,tag_id)
			  VALUES
				  ($1,$2)
			  `,
    [id, tagId]
  );
  await sql.end();
  revalidateAll();
};

export const onRemoveTag = async (id: Category["id"], tagId: Tag["id"]) => {
  const sql = await db();
  await sql.query(
    `
				DELETE FROM
				  category_tags
				WHERE
					category_id=$1
				AND
					tag_id=$2
				  `,
    [id, tagId]
  );
  await sql.end();
  revalidateAll();
};

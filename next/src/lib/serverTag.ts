"use server";

import { DBTag } from "../../types/Database";
import { Tag } from "../../types/tag";
import { DEFAULT_USER_ID } from "./dangerous";
import { db } from "./db";
import { DBTagToTag } from "./tag";
import { revalidateAll } from "./paths";

export const getTags = async () => {
  const sql = await db();
  const tags = await sql.query<DBTag>(`
		SELECT
			*
		FROM
			tags
		`);

  await sql.end();
  return tags.rows.map(DBTagToTag);
};

export const onEditTag = async (
  id: Tag["id"],
  toUpdate: Pick<Tag, "name" | "color" | "description">
) => {
  const sql = await db();
  await sql.query<DBTag>(
    `
		UPDATE
			tags
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
  revalidateAll();
};

export const onCreateTag = async (
  toCreate: Pick<Tag, "color" | "description" | "name">
) => {
  const sql = await db();
  await sql.query<DBTag>(
    `
		INSERT INTO
			tags
			(name,description,color,user_id)
		VALUES
			($1,$2,$3,$4)
	  `,
    [toCreate.name, toCreate.description, toCreate.color, DEFAULT_USER_ID]
  );

  await sql.end();
  revalidateAll();
};

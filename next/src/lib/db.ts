import { Client } from "pg";

export const db = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing database url");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  return client;
};

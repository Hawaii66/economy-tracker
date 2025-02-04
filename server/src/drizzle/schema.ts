import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  pgTable,
  integer,
  varchar,
  date,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const db = drizzle(process.env.DATABASE_URL!);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  clerkId: varchar({ length: 255 }).notNull().unique(),
});

export const accountsTable = pgTable("accounts", {
  id: uuid().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
  name: varchar({ length: 255 }).notNull(),
});

export const importedTransactionsTable = pgTable("imported_transactions", {
  id: uuid().primaryKey(),
  accountId: uuid()
    .notNull()
    .references(() => accountsTable.id),
  date: date().notNull(),
  text: varchar({ length: 255 }).notNull(),
  amount: integer().notNull(),
  collisionMitigator: varchar({ length: 255 }).notNull().unique(),
  imported: boolean().notNull(),
});

export const categoriesTable = pgTable("categories", {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  target: integer().notNull(),
  color: varchar({ length: 7 }).notNull(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
});

export const transactionsTable = pgTable("transactions", {
  id: uuid().primaryKey(),
  accountId: uuid()
    .notNull()
    .references(() => accountsTable.id),
  date: date().notNull(),
  text: varchar({ length: 255 }).notNull(),
  amount: integer().notNull(),
  categoryId: uuid()
    .notNull()
    .references(() => categoriesTable.id),
  importedTransactionId: uuid()
    .notNull()
    .references(() => importedTransactionsTable.id),
  type: varchar({ length: 255 }).notNull(),
  swishRecipientId: uuid().references(() => swishRecipientsTable.id),
  customerId: uuid().references(() => customersTable.id),
  transferedAccountId: uuid().references(() => accountsTable.id),
});

export const swishRecipientsTable = pgTable("swish_recipients", {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  swishNumber: varchar({ length: 255 }).notNull(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
});

export const customersTable = pgTable("customers", {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
  rename: varchar({ length: 255 }).notNull(),
  color: varchar({ length: 7 }).notNull(),
  categoryId: uuid().references(() => categoriesTable.id),
});

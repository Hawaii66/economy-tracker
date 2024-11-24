import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  date,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 7 }),
  description: varchar("description", { length: 1024 }),
});

export const tags = pgTable("tags", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 7 }),
  description: varchar("description", { length: 1024 }),
});

export const categoryTags = pgTable("category_tags", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id)
    .notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
});

export const importedTransactions = pgTable("imported_transactions", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  verificationNumber: varchar("verification_number", { length: 100 }).notNull(),
  date: date("date").notNull(),
  amount: integer("amount").notNull(),
  text: varchar("text", { length: 255 }).notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
});

export const transactions = pgTable("transactions", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  verificationNumber: varchar("verification_number", { length: 100 }).notNull(),
  date: date("date").notNull(),
  amount: integer("amount").notNull(),
  text: varchar("text", { length: 255 }).notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
});

export const transaction_tags = pgTable("transaction_tags", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id)
    .notNull(),
});

export const customerType = pgEnum("customer_type", ["company", "personal"]);

export const customers = pgTable("customers", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  rename: varchar("rename", { length: 255 }).notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
  type: customerType("type"),
});

export const ignoredCustomers = pgTable("ignored_customers", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: customerType("type"),
});

export const customerTags = pgTable("customer_tags", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  customerId: uuid("customer_id")
    .references(() => customers.id)
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id)
    .notNull(),
});

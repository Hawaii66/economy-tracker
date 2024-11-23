"use server";

import { Customer } from "../../types/customer";
import { DBCategory, DBCustomer } from "../../types/Database";
import { ImportedCustomer } from "../../types/importFile";
import { getImportedCustomers, parseCSV } from "./csv";
import { DBCustomerToCustomer } from "./customer";
import { db } from "./db";

export const addNewCustomersFromCSV = async (csv: string) => {
  const transactions = parseCSV(csv);
  const transactionCustomers = getImportedCustomers(transactions);
  const customers = await getCustomers();
  const oldCustomerNames = new Set(customers.map((i) => i.name));

  const newCustomers = transactionCustomers.filter((customer) => {
    return !oldCustomerNames.has(customer.name);
  });

  await insertCustomers(newCustomers);
  return getCustomers();
};

export const getCustomers = async () => {
  const sql = await db();

  const customers = await sql.query<
    Pick<DBCustomer, "id" | "name" | "rename" | "category_id" | "type"> &
      Pick<DBCategory, "color" | "description"> & { catagoryName: string }
  >(`
		SELECT
			cus.id,
			cus.name,
			cus.rename,
			cus.category_id,
			cus.type,
			cat.color,
			cat.description,
			cat.name as "categoryName"
		FROM
			customers cus
		LEFT JOIN
			categories cat
			ON
			cat.id = cus.category_id
		`);

  await sql.end();

  return Customer.array().parse(customers.rows.map(DBCustomerToCustomer));
};

const insertCustomers = async (customers: ImportedCustomer[]) => {
  const sql = await db();

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    await sql.query(
      `
			INSERT INTO
				customers
				(name,rename,category_id,type)
			VALUES
				($1,$2,$3,$4)
			`,
      [customer.name, customer.name, null, customer.type]
    );
  }

  await sql.end();
};

export const updateCustomer = async (
  customerId: Customer["id"],
  toUpdate: Pick<Customer, "rename"> & { categoryId: number | null }
) => {
  const sql = await db();

  await sql.query(
    `
		UPDATE
			customers
		SET
			rename=$1,
			category_id=$2
		WHERE
			id=$3
		`,
    [toUpdate.rename, toUpdate.categoryId, customerId]
  );

  await sql.end();
};

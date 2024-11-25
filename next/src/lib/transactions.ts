import { format } from "date-fns";
import { DBCategory, DBCustomer, DBTransaction } from "../../types/Database";
import { FilterOptions, Transaction } from "../../types/transaction";
import { db } from "./db";

export const getTransactionsCount = async () => {
  const sql = await db();

  const count = await sql.query<{ estimated_rows: number }>(`
		SELECT 
			reltuples AS estimated_rows
		FROM 
			pg_class
		WHERE 
			relname = 'transactions';

		`);

  await sql.end();

  return count.rows[0].estimated_rows ?? 0;
};

export const getTransactios = async (filters: FilterOptions) => {
  const sql = await db();
  const minAmount = Number.isInteger(parseInt(filters.minAmount))
    ? parseInt(filters.minAmount) * 100
    : null;
  const maxAmount = Number.isInteger(parseInt(filters.maxAmount))
    ? parseInt(filters.maxAmount) * 100
    : null;

  // Dynamically build the query
  let query = `
  SELECT
    t.id,
    t.verification_number,
    t.date,
    t.amount,
    t.text,
    t.customer_id,
    c.name,
    c.category_id,
    c.rename,
    c.type,
    cat.color,
    cat.description,
    cat.name,
	cat.expected_per_month,
    p.id as "picked_category_id",
    p.name as "picked_category_name",
    p.description as "picked_category_description",
    p.color as "picked_category_color",
	p.expected_per_month as "picked_expected_per_month"
  FROM
    transactions t
  LEFT JOIN
    customers c
    ON
    t.customer_id = c.id
  LEFT JOIN
    categories cat
    ON
    cat.id = c.category_id
  LEFT JOIN
    categories p
    ON
    p.id = t.category_id
  WHERE
    t.date BETWEEN $1 AND $2
`;

  const params: (string | number | Date)[] = [
    filters.startDate,
    filters.endDate,
  ];

  // Add the minAmount filter if it is not null
  if (minAmount !== null) {
    query += ` AND t.amount > $${params.length + 1}`;
    params.push(minAmount);
  }

  // Add the maxAmount filter if it is not null
  if (maxAmount !== null) {
    query += ` AND t.amount < $${params.length + 1}`;
    params.push(maxAmount);
  }

  if (filters.customerId !== "") {
    query += ` AND t.customer_id = $${params.length + 1}`;
    params.push(filters.customerId);
  }

  if (filters.categoryId !== "") {
    query += ` AND t.category_id = $${params.length + 1}`;
    params.push(filters.categoryId);
  }

  const rows = await sql.query<
    Pick<
      DBTransaction,
      "id" | "verification_number" | "date" | "amount" | "text" | "customer_id"
    > &
      Pick<DBCustomer, "name" | "category_id" | "rename" | "type"> &
      Pick<
        DBCategory,
        "color" | "description" | "name" | "expected_per_month"
      > & {
        picked_category_id: string;
        picked_category_color: string;
        picked_category_name: string;
        picked_category_description: string;
        picked_expected_per_month: number;
      }
  >(query, params);

  console.log(rows.rows[0]);

  await sql.end();
  const array: Transaction[] = rows.rows.map((row) => ({
    amount: row.amount,
    customer: row.customer_id
      ? {
          category: {
            color: row.color,
            description: row.description,
            id: row.category_id,
            name: row.name,
            expectedPerMonth: row.expected_per_month,
          },
          id: row.customer_id,
          name: row.name,
          rename: row.rename,
          type: row.type,
        }
      : null,

    date: row.date,
    id: row.id,
    text: row.text,
    verificationNumber: row.verification_number,
    category: {
      id: row.picked_category_id,
      name: row.picked_category_name,
      description: row.picked_category_description,
      color: row.picked_category_color,
      expectedPerMonth: row.picked_expected_per_month,
    },
  }));

  const searchQuery = filters.query.trim().toLowerCase();
  const searchFiltered = array.filter((i) => {
    if (searchQuery === "") return true;

    if (i.verificationNumber === searchQuery) return true;
    if (i.text.toString().includes(searchQuery)) return true;
    if (format(i.date, "yyyy-MM-dd").toString().includes(searchQuery))
      return true;
    if ((i.amount / 100).toString().trim().toLowerCase().includes(searchQuery))
      return true;
    if (i.category.name.trim().toLowerCase().includes(searchQuery)) return true;
    if (i.customer?.rename.trim().toLowerCase().includes(searchQuery))
      return true;

    return false;
  });

  return Transaction.array().parse(searchFiltered);
};

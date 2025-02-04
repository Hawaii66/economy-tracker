import { isBefore, isWithinInterval } from "date-fns";
import { TransactionRow } from "./types";

const removeTransactionDate = (text: string) => {
  const regex = /^(.*)\/\d{2}-\d{2}-\d{2}$/;

  if (regex.test(text)) {
    return text.replace(regex, "$1");
  }

  return text;
};

const formatText = (text: string) => {
  return removeTransactionDate(text).trim();
};

const formatCollissionMitigator = (text: string[]) => text.join("-|-");

export const parseSEBCSV = (csv: string) => {
  const rows = csv.split("\n");
  const transactions: TransactionRow[] = rows
    .slice(1, rows.length - 1)
    .map((row) => {
      const cells = row.split(";");
      const [date, _, _2, text, amount, _3] = cells;
      return {
        date: new Date(date),
        amount: Math.round(parseFloat(amount.replace(",", ".")) * 100),
        text: formatText(text),
        collisionMitigator: formatCollissionMitigator(cells),
      };
    });

  return transactions;
};

export const filterTransactions = (
  transactions: TransactionRow[],
  startDate: Date,
  endDate: Date
) => {
  return transactions.filter((transaction) =>
    isWithinInterval(transaction.date, { start: startDate, end: endDate })
  );
};

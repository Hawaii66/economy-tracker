import { ImportedCustomer, ImportRow } from "../../types/importFile";

export const parseCSV = (csv: string): ImportRow[] => {
  const allRows = csv.split("\n");
  const rows = allRows.slice(1, allRows.length - 1);
  const columns = rows.map((i) => i.split(";"));

  const mapped: ImportRow[] = columns.map((column) => {
    return {
      amount: Math.floor(parseFloat(column[4]) * 100),
      date: new Date(column[1]),
      text: column[3],
      verificationNumber: parseInt(column[2]),
    };
  });

  return ImportRow.array().parse(mapped);
};

export const getImportedCustomers = (rows: ImportRow[]): ImportedCustomer[] => {
  const unique = new Set(rows.map((i) => maybeRemoveDate(i.text)));

  const customers = Array.from(unique).map((i) => ({
    name: i,
    type: isPersonal(i) ? "personal" : "company",
  }));

  return ImportedCustomer.array().parse(customers);
};

const maybeRemoveDate = (str: string) => {
  return str.replace(/\/\d{2}-\d{2}-\d{2}$/, "");
};

const isPersonal = (str: string) => {
  return /^\d{11}$/.test(str);
};

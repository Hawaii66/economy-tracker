import {
  Account,
  Category,
  ClassifiedChoice,
  ClassifyTransaction,
  Customer,
  SwishRecipient,
  Transaction,
} from "@/types";

type GetToken = () => Promise<string | null>;

export const getSwishRecipients = async (
  getToken: GetToken
): Promise<SwishRecipient[]> => {
  const response = await fetch("http://localhost:8000/swish", {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  return (await response.json()) as SwishRecipient[];
};

export const insertSwishRecipient = async (
  data: Pick<SwishRecipient, "name" | "swishNumber">,
  getToken: GetToken
): Promise<void> => {
  await fetch("http://localhost:8000/swish", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const getCustomers = async (getToken: GetToken): Promise<Customer[]> => {
  const response = await fetch("http://localhost:8000/customer", {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  return (await response.json()) as Customer[];
};

export const insertCustomer = async (
  data: Pick<Customer, "name" | "color" | "categoryId">,
  getToken: GetToken
): Promise<void> => {
  await fetch("http://localhost:8000/customer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const insertCustomerDetection = async (
  customerId: string,
  name: string,
  getToken: GetToken
) => {
  await fetch("http://localhost:8000/customer/detection", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId,
      name,
    }),
  });
};

export const getClassifyTransactions = async (
  getToken: GetToken
): Promise<ClassifyTransaction[]> => {
  const response = await fetch("http://localhost:8000/transaction/upload", {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  return ((await response.json()) as ClassifyTransaction[]).map((i) => ({
    ...i,
    date: new Date(i.date),
  }));
};

export const classifyTransaction = async (
  data: ClassifiedChoice,
  getToken: GetToken
) => {
  await fetch("http://localhost:8000/transaction/classify", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const getAccounts = async (getToken: GetToken): Promise<Account[]> => {
  const response = await fetch("http://localhost:8000/account", {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  return (await response.json()) as Account[];
};

export const insertAccount = async (
  data: Pick<Account, "name">,
  getToken: GetToken
): Promise<void> => {
  await fetch("http://localhost:8000/account", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const getCategories = async (
  getToken: GetToken
): Promise<Category[]> => {
  const response = await fetch("http://localhost:8000/category", {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  return (await response.json()) as Category[];
};

export const insertCategory = async (
  data: Pick<Category, "name" | "color" | "target">,
  getToken: GetToken
): Promise<void> => {
  await fetch("http://localhost:8000/category", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const getTransactions = async (
  from: Date,
  to: Date,
  getToken: GetToken
) => {
  const response = await fetch(
    `http://localhost:8000/transaction?from=${from}&to=${to}`,
    {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    }
  );
  return (await response.json()) as Transaction[];
};

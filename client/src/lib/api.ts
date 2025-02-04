import { Customer, SwishRecipient } from "@/types";

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
  data: Pick<Customer, "name" | "color" | "rename">,
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

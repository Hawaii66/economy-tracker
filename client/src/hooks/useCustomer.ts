import { getCustomers, insertCustomer as _insertCustomer } from "@/lib/api";
import { Customer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export const useCustomer = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { getToken } = useAuth();

  const load = async () => {
    const response = await getCustomers(getToken);
    setCustomers(response);
  };

  const insertCustomer = async (
    data: Pick<Customer, "name" | "color" | "rename" | "categoryId">
  ) => {
    await _insertCustomer(data, getToken);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return {
    customers,
    refetch: load,
    insertCustomer,
  };
};

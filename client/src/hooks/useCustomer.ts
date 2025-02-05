import {
  getCustomers,
  insertCustomer as _insertCustomer,
  insertCustomerDetection as _insertCustomerDetection,
} from "@/lib/api";
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
    data: Pick<Customer, "name" | "color" | "categoryId">
  ) => {
    await _insertCustomer(data, getToken);
    await load();
  };

  const insertCustomerDetection = async (customerId: string, name: string) => {
    await _insertCustomerDetection(customerId, name, getToken);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return {
    customers,
    refetch: load,
    insertCustomer,
    insertCustomerDetection,
  };
};

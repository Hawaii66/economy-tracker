import { getTransactions } from "@/lib/api";
import { Transaction } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { endOfMonth, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [from, setFrom] = useState(startOfMonth(new Date()));
  const [to, setTo] = useState(endOfMonth(new Date()));
  const { getToken } = useAuth();

  const load = async () => {
    const response = await getTransactions(from, to, getToken);
    setTransactions(response);
  };

  useEffect(() => {
    load();
  }, [from, to]);

  return {
    transactions,
    refetch: load,
    setFrom,
    setTo,
    to,
    from,
  };
};

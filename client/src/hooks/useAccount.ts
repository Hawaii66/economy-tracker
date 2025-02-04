import { getAccounts, insertAccount as _insertAccount } from "@/lib/api";
import { Account, SwishRecipient } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export const useAccount = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { getToken } = useAuth();

  const load = async () => {
    const response = await getAccounts(getToken);
    setAccounts(response);
  };

  const insertAccount = async (
    data: Pick<SwishRecipient, "name" | "swishNumber">
  ) => {
    await _insertAccount(data, getToken);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return {
    accounts,
    refetch: load,
    insertAccount,
  };
};

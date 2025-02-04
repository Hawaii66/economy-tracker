import { getSwishRecipients, insertSwishRecipient } from "@/lib/api";
import { SwishRecipient } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export const useSwish = () => {
  const [recipients, setRecipients] = useState<SwishRecipient[]>([]);
  const { getToken } = useAuth();

  const load = async () => {
    const response = await getSwishRecipients(getToken);
    setRecipients(response);
  };

  const insertRecipient = async (
    data: Pick<SwishRecipient, "name" | "swishNumber">
  ) => {
    await insertSwishRecipient(data, getToken);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return {
    recipients,
    refetch: load,
    insertRecipient,
  };
};

import {
  getClassifyTransactions,
  classifyTransaction as externalClassifyTransaction,
} from "@/lib/api";
import {
  ClassifiedChoice,
  ClassifiedTransaction,
  ClassifyTransaction,
  Customer,
  SwishRecipient,
} from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useSwish } from "./useSwish";
import { useCustomer } from "./useCustomer";
import { useAccount } from "./useAccount";
import { useCategory } from "./useCategory";

const classifyTransaction = (
  transaction: ClassifyTransaction,
  swishRecipients: SwishRecipient[],
  customers: Customer[]
): ClassifiedTransaction => {
  const swish = swishRecipients.find((swish) =>
    transaction.text.includes(swish.swishNumber)
  );
  if (swish) {
    return {
      ...transaction,
      classed: {
        type: "Swish",
        swish,
        forced: true,
      },
    };
  }
  const customer = customers.find((customer) =>
    transaction.text.includes(customer.name)
  );
  if (customer) {
    return {
      ...transaction,
      classed: {
        type: "Customer",
        customer,
        forced: true,
      },
    };
  }

  return {
    ...transaction,
    classed: {
      type: "None",
      forced: false,
    },
  };
};

export const useClassifyTransaction = () => {
  const [toClassify, setToClassify] = useState<ClassifiedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const { recipients } = useSwish();
  const { customers } = useCustomer();
  const { accounts } = useAccount();
  const { categories } = useCategory();

  const load = async () => {
    const toClassify = await getClassifyTransactions(getToken);
    setToClassify(
      toClassify.map((transaction) =>
        classifyTransaction(transaction, recipients, customers)
      )
    );
  };

  const onClassify = async (data: ClassifiedChoice) => {
    setLoading(true);
    await externalClassifyTransaction(data, getToken);
    await load();
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [recipients, customers]);

  return {
    toClassify,
    accounts,
    loading,
    onClassify,
    categories,
  };
};

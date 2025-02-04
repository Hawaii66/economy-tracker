import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatSEK } from "@/lib/utils";
import {
  Account,
  Category,
  ClassifiedChoice,
  ClassifiedTransaction,
  ClassifyTypes,
} from "@/types";
import { format } from "date-fns";
import { useEffect, useState } from "react";

type Props = {
  transaction: ClassifiedTransaction;
  accounts: Account[];
  onClassify: (choice: ClassifiedChoice) => void;
  disabled: boolean;
  categories: Category[];
};

export default function ClassifyTransaction({
  accounts,
  transaction,
  disabled,
  onClassify,
  categories,
}: Props) {
  const [type, setType] = useState<(typeof ClassifyTypes)[number]>(
    transaction.classed.type
  );
  const [account, setAccount] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(
    transaction.classed.type === "Customer"
      ? transaction.classed.customer.categoryId
      : null
  );

  useEffect(() => {
    setType(transaction.classed.type);
    if (transaction.classed.type === "Customer") {
      setCategory(transaction.classed.customer.categoryId);
    }
  }, [transaction]);

  return (
    <AccordionItem key={transaction.id} value={transaction.id}>
      <AccordionTrigger>
        <div className="flex flex-row justify-between items-center gap-2 pr-4 w-full">
          <p>
            {type} - {transaction.text}
          </p>
          <p>{formatSEK(transaction.amount)}</p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col justify-between items-center gap-2">
          <p>
            {transaction.account.name} {format(transaction.date, "yyyy-MM-dd")}{" "}
          </p>
          <Separator />
          <div className="flex flex-row justify-center items-center gap-4 px-2 w-full">
            <div className="w-1/2">
              <Select
                disabled={transaction.classed.forced || disabled}
                value={type}
                onValueChange={(t) =>
                  setType(t as (typeof ClassifyTypes)[number])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ClassifyTypes.map((i) => (
                    <SelectItem
                      key={i}
                      disabled={i === "Customer" || i === "Swish"}
                      value={i}
                    >
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/2">
              {type === "Swish" && transaction.classed.type === "Swish" && (
                <p>{transaction.classed.swish.name}</p>
              )}
              {type === "Customer" &&
                transaction.classed.type === "Customer" && (
                  <p>{transaction.classed.customer.rename}</p>
                )}
              {type === "Internal" && (
                <Select
                  disabled={disabled}
                  value={account ?? ""}
                  onValueChange={setAccount}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter((i) => i.id !== transaction.account.id)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <Separator />
          <div className="flex flex-row justify-between items-center gap-4 px-2 w-full">
            <div className="w-1/2">
              <Select value={category ?? ""} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-row justify-end items-center w-1/2">
              <Button
                disabled={
                  disabled ||
                  (type === "Internal" && account === null) ||
                  !category ||
                  type === "None"
                }
                onClick={() => {
                  if (!category) return;

                  switch (type) {
                    case "Customer": {
                      if (transaction.classed.type !== "Customer") return;
                      onClassify({
                        type: "Customer",
                        transactionId: transaction.id,
                        otherId: transaction.classed.customer.id,
                        categoryId: category,
                      });
                      break;
                    }
                    case "Swish": {
                      if (transaction.classed.type !== "Swish") return;
                      onClassify({
                        type: "Customer",
                        transactionId: transaction.id,
                        otherId: transaction.classed.swish.id,
                        categoryId: category,
                      });
                      break;
                    }
                    case "Internal": {
                      if (account === null) return;

                      onClassify({
                        type: "Customer",
                        transactionId: transaction.id,
                        otherId: account,
                        categoryId: category,
                      });
                      break;
                    }
                  }
                }}
              >
                Import
              </Button>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

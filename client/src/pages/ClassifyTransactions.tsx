import ClassifyTransaction from "@/components/ClassifyTransaction";
import { Accordion } from "@/components/ui/accordion";
import { useClassifyTransaction } from "@/hooks/useClassifyTransaction";
import { useEffect, useState } from "react";

export default function ClassifyTransactions() {
  const { toClassify, accounts, loading, onClassify, categories } =
    useClassifyTransaction();

  const [opened, setOpened] = useState<string[]>([]);

  useEffect(() => {
    if (toClassify.length === 0) {
      setOpened([]);
      return;
    }
    const sorted = toClassify.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    setOpened([sorted[0].id]);
  }, [toClassify]);

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <h1>Classify Transactions</h1>
      <div className="px-12 w-full">
        <Accordion value={opened} onValueChange={setOpened} type="multiple">
          {toClassify
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((transaction) => (
              <ClassifyTransaction
                accounts={accounts}
                transaction={transaction}
                key={transaction.id}
                disabled={loading}
                categories={categories}
                onClassify={onClassify}
              />
            ))}
        </Accordion>
      </div>
    </div>
  );
}

"use client";

import CategoryBadge from "@/components/CategoryBadge";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { formatCentSEK } from "@/lib/format";
import { Check, Loader } from "lucide-react";
import { Category } from "../../../types/category";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { approveTransaction } from "@/lib/serverImportedTransaction";
import { ImportedTransaction } from "../../../types/transaction";

type Props = {
  transaction: ImportedTransaction;
  categories: Category[];
};

export default function PendingTransactionRow({
  categories,
  transaction,
}: Props) {
  const [categoryId, setCategoryId] = useState<Category["id"] | undefined>(
    transaction.customer?.category.id
  );
  const [isMutating, setIsMutating] = useState(false);

  return (
    <TableRow>
      <TableCell>{transaction.verificationNumber}</TableCell>
      <TableCell>{format(transaction.date, "yyyy-MM-dd")}</TableCell>
      <TableCell>
        {transaction.customer ? transaction.customer.rename : transaction.text}
      </TableCell>
      <TableCell>{formatCentSEK(transaction.amount)}</TableCell>
      <TableCell
        className="gap-2 grid"
        style={{ gridTemplateColumns: "2fr 1fr" }}
      >
        <Select value={categoryId} onValueChange={setCategoryId}>
          <div className="flex flex-row gap-2">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <Button
              disabled={!categoryId || isMutating}
              onClick={async () => {
                if (!categoryId) return;
                setIsMutating(true);

                await approveTransaction(transaction.id, categoryId);
                setIsMutating(false);
              }}
            >
              {isMutating ? <Loader className="animate-spin" /> : <Check />}
            </Button>
          </div>

          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <CategoryBadge category={category} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
}

import { getImportedTransactions } from "@/lib/serverImportedTransaction";
import { getCategories } from "@/lib/serverCategory";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PendingTransactionRow from "./PendingTransactionRow";

export default async function Page() {
  const transactions = await getImportedTransactions();
  const categories = await getCategories();
  return (
    <div className="flex flex-col justify-start items-start gap-2 px-12 py-12 w-full">
      <Table>
        <TableCaption>Pending Transaction</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Verification Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>To / From</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((transaction) => (
              <PendingTransactionRow
                key={transaction.id}
                categories={categories}
                transaction={transaction}
              />
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

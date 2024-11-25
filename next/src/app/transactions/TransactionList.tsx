import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "../../../types/transaction";
import { formatCentSEK } from "@/lib/format";
import { format } from "date-fns";
import CategoryBadge from "@/components/CategoryBadge";
import CustomerBadge from "@/components/CustomerBadge";

type Props = {
  transactions: Transaction[];
};

export default function TransactionList({ transactions }: Props) {
  return (
    <Table>
      <TableCaption> {transactions.length} Transactions </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Verification Number</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>To / From</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions
          .sort((a, b) =>
            `${format(a.date, "yyyy-MM-dd")} | ${a.text}`.localeCompare(
              `${format(b.date, "yyyy-MM-dd")} | ${b.text}`
            )
          )
          .map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.verificationNumber}</TableCell>
              <TableCell>{format(transaction.date, "yyyy-MM-dd")}</TableCell>
              <TableCell>
                {transaction.customer
                  ? transaction.customer.rename
                  : transaction.text}
              </TableCell>
              <TableCell>{formatCentSEK(transaction.amount)}</TableCell>
              <TableCell>
                {transaction.customer && (
                  <CustomerBadge customer={transaction.customer} />
                )}
              </TableCell>
              <TableCell>
                <CategoryBadge category={transaction.category} />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

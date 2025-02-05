import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactions } from "@/hooks/useTransactions";
import { formatSEK } from "@/lib/utils";
import { format } from "date-fns";

export default function Transactions() {
  const { transactions, from, to, setFrom, setTo } = useTransactions();

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <h1>Transactions</h1>
      <div className="flex flex-row justify-center items-center gap-4">
        <Label>From</Label>
        <DatePicker date={from} setDate={setFrom} />
        <Label>To</Label>
        <DatePicker date={to} setDate={setTo} />
      </div>
      <Separator />
      <Table>
        <TableCaption>
          All transactions between {format(from, "yyyy-MM-dd")} to{" "}
          {format(to, "yyyy-MM-dd")}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Other</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{format(transaction.date, "yyyy-MM-dd")}</TableCell>
              <TableCell>{formatSEK(transaction.amount)}</TableCell>
              <TableCell>{transaction.account.name}</TableCell>
              <TableCell className="flex flex-row gap-4">
                <div
                  className="rounded-full w-4 h-4"
                  style={{ backgroundColor: transaction.category.color }}
                />{" "}
                {transaction.category.name}
              </TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell className="flex flex-row gap-4">
                {transaction.type === "Swish" ? (
                  transaction.swish.name
                ) : transaction.type === "Customer" ? (
                  <>
                    <div
                      className="rounded-full w-4 h-4"
                      style={{ backgroundColor: transaction.customer.color }}
                    />{" "}
                    {transaction.customer.name}
                  </>
                ) : (
                  transaction.otherAccount.name
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

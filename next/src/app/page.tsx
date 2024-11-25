import { getTransactios } from "@/lib/transactions";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import TransactionList from "./transactions/TransactionList";
import PerCategory from "@/components/home/PerCategory";
import { getCategories } from "@/lib/serverCategory";
import { getCustomers } from "@/lib/serverCustomers";
import PerCustomer from "@/components/home/PerCustomer";
import PerGoal from "@/components/home/PerGoal";
import { Label } from "@/components/ui/label";

type QueryParams = {
  month: string | undefined;
};

type Props = {
  searchParams: Promise<QueryParams>;
};

export const dynamic = "force-dynamic";

export default async function Home({ searchParams: _searchParams }: Props) {
  const searchParams = await _searchParams;

  const month =
    searchParams.month === undefined
      ? new Date()
      : new Date(`${searchParams.month}-01`);

  const transactions = await getTransactios({
    startDate: startOfMonth(subMonths(month, 1)),
    endDate: endOfMonth(month),
    categoryId: "",
    customerId: "",
    maxAmount: "a",
    minAmount: "a",
    query: "",
  });
  const categories = await getCategories();
  const customers = await getCustomers();

  return (
    <div className="flex flex-col gap-6 p-12">
      <div className="items-center gap-4 grid grid-cols-2">
        <div className="flex flex-col justify-evenly items-center">
          <Label className="font-bold text-center text-lg">
            Transactions / Category
          </Label>
          <PerCategory transactions={transactions} categories={categories} />
          <Label className="font-bold text-center text-lg">
            Transactions / Customer
          </Label>
          <PerCustomer transactions={transactions} customers={customers} />
        </div>
        <div className="flex flex-col gap-4 h-full">
          <Label className="font-bold text-center text-lg">Spend Goal</Label>
          <PerGoal transactions={transactions} categories={categories} />
        </div>
      </div>
      <TransactionList transactions={transactions} />
    </div>
  );
}

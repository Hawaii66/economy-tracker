import { format, isBefore, subMonths } from "date-fns";
import Filters, { QueryParams } from "./Filters";
import { FilterOptions } from "../../../types/transaction";
import { getTransactios } from "@/lib/transactions";
import TransactionList from "./TransactionList";
import { getCategories } from "@/lib/serverCategory";
import { getCustomers } from "@/lib/serverCustomers";

export default async function Page({
  searchParams: _searchParams,
}: {
  searchParams: Promise<QueryParams>;
}) {
  const searchParams = await _searchParams;
  const filter: FilterOptions = {
    startDate: searchParams.startDate
      ? new Date(searchParams.startDate)
      : subMonths(new Date(), 1),
    endDate: searchParams.endDate ? new Date(searchParams.endDate) : new Date(),
    minAmount: searchParams.minAmount ?? "",
    maxAmount: searchParams.maxAmount ?? "",
    categoryId: searchParams.categoryId ?? "",
    customerId: searchParams.customerId ?? "",
    query: searchParams.query ?? "",
  };
  if (isBefore(filter.endDate, filter.startDate)) {
    return (
      <div className="p-12">
        <p className="font-bold text-lg">Start date must be before end date</p>
        <p className="pl-2">
          Start date: {format(filter.startDate, "yyyy-MM-dd")}
        </p>
        <p className="pl-2">End date: {format(filter.endDate, "yyyy-MM-dd")}</p>
      </div>
    );
  }

  const transactions = await getTransactios(filter);
  const categories = await getCategories();
  const customers = await getCustomers();

  return (
    <div className="flex flex-col gap-6 p-12">
      <Filters
        defaultFilters={filter}
        categories={categories}
        customers={customers}
      />
      <TransactionList transactions={transactions} />
    </div>
  );
}

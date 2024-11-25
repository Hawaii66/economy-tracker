"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";
import { Label } from "@/components/ui/label";
import { addDays, format, subDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FilterOptions } from "../../../types/transaction";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CategoryBadge from "@/components/CategoryBadge";
import { Category } from "../../../types/category";
import { Customer } from "../../../types/customer";
import CustomerBadge from "@/components/CustomerBadge";

export type QueryParams = {
  startDate: string | undefined;
  endDate: string | undefined;
  minAmount: string | undefined;
  maxAmount: string | undefined;
  customerId: string | undefined;
  categoryId: string | undefined;
  query: string | undefined;
};

type Strict<T extends object> = {
  [K in keyof T]-?: Exclude<T[K], undefined>;
};

type Props = {
  defaultFilters: FilterOptions;
  categories: Category[];
  customers: Customer[];
};

export default function Filters({
  defaultFilters,
  categories,
  customers,
}: Props) {
  const [filters, setFilters] = useState<FilterOptions>({
    ...defaultFilters,
    categoryId:
      defaultFilters.categoryId === "" ? "-" : defaultFilters.categoryId,
    customerId:
      defaultFilters.customerId === "" ? "-" : defaultFilters.customerId,
  });
  const router = useRouter();

  const onFilter = () => {
    const newQueryParams: Strict<QueryParams> = {
      startDate: format(filters.startDate, "yyyy-MM-dd"),
      endDate: format(filters.endDate, "yyyy-MM-dd"),
      maxAmount: filters.maxAmount,
      minAmount: filters.minAmount,
      categoryId: filters.categoryId === "-" ? "" : filters.categoryId,
      customerId: filters.customerId === "-" ? "" : filters.customerId,
      query: filters.query,
    };

    const searchParams = new URLSearchParams(newQueryParams).toString();
    const newUrl = `?${searchParams}`;

    router.push(newUrl);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="col-span-4">Filters</h2>
      <div className="items-center gap-4 grid grid-cols-3">
        <div className="flex flex-col justify-start items-start gap-2">
          <Label>Start date</Label>
          <DatePicker
            date={filters.startDate}
            setDate={(date) => setFilters((o) => ({ ...o, startDate: date }))}
            maxDate={subDays(filters.endDate, 1)}
          />
        </div>
        <div className="flex flex-col justify-start items-start gap-2">
          <Label>End date</Label>
          <DatePicker
            date={filters.endDate}
            setDate={(date) => setFilters((o) => ({ ...o, endDate: date }))}
            minDate={addDays(filters.startDate, 1)}
          />
        </div>
      </div>
      <div className="items-center gap-4 grid grid-cols-3">
        <div className="flex flex-col justify-start items-start gap-2">
          <Label>Min amount</Label>
          <Input
            type="number"
            value={filters.minAmount?.toString()}
            onChange={(e) =>
              setFilters((o) => ({
                ...o,
                minAmount: e.target.value,
              }))
            }
            max={
              filters.maxAmount === "" ? undefined : parseInt(filters.maxAmount)
            }
          />
        </div>

        <div className="flex flex-col justify-start items-start gap-2">
          <Label>Max amount</Label>
          <Input
            type="number"
            value={filters.maxAmount?.toString()}
            onChange={(e) =>
              setFilters((o) => ({
                ...o,
                maxAmount: e.target.value,
              }))
            }
            max={
              filters.minAmount === "" ? undefined : parseInt(filters.minAmount)
            }
          />
        </div>
      </div>
      <div className="items-center gap-4 grid grid-cols-3">
        <div className="flex flex-col justify-start items-start gap-2">
          <Label>Category</Label>
          <Select
            value={filters.categoryId}
            onValueChange={(c) => setFilters((o) => ({ ...o, categoryId: c }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={"-"}>All</SelectItem>
              {categories
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <CategoryBadge category={category} />
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col justify-start items-start gap-2">
          <Label>Customer</Label>
          <Select
            value={filters.customerId}
            onValueChange={(c) => setFilters((o) => ({ ...o, customerId: c }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={"-"}>All</SelectItem>
              {customers
                .sort((a, b) => a.rename.localeCompare(b.rename))
                .map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <CustomerBadge customer={customer} />
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="items-center gap-4 grid grid-cols-3">
        <div className="flex flex-col justify-start items-start gap-2">
          <Label>Search</Label>
          <Input
            value={filters.query}
            onChange={(e) =>
              setFilters((o) => ({ ...o, query: e.target.value }))
            }
          />
        </div>
      </div>
      <div>
        <Button onClick={onFilter}>Apply filters</Button>
      </div>
    </div>
  );
}

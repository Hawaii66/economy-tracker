import { ChartContainer } from "@/components/ui/chart";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTransactions } from "@/hooks/useTransactions";
import { formatSEK } from "@/lib/utils";
import { useMemo } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

export default function Dashboard() {
  const { transactions, from, to, setFrom, setTo } = useTransactions();

  const expenses = useMemo(() => {
    return transactions.filter((i) => i.amount < 0);
  }, [transactions]);

  const income = useMemo(() => {
    return transactions.filter((i) => i.amount > 0);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const grouped = expenses.reduce((acc, transaction) => {
      const key = transaction.category.name;
      const prev = acc[key];
      if (prev) {
        acc[key] = {
          ...prev,
          amount: prev.amount + Math.abs(transaction.amount),
        };
      } else {
        acc[key] = {
          amount: Math.abs(transaction.amount),
          color: transaction.category.color,
        };
      }
      return acc;
    }, {} as Record<string, { amount: number; color: string }>);

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      color: value.color,
      value: value.amount,
    }));
  }, [expenses]);

  // Group by Company/Swish
  const companyData = useMemo(() => {
    const grouped = expenses.reduce((acc, transaction) => {
      switch (transaction.type) {
        case "Customer": {
          const prev = acc[transaction.customer.name];
          if (prev) {
            acc[transaction.customer.name] = {
              ...prev,
              amount: prev.amount + Math.abs(transaction.amount),
            };
          } else {
            acc[transaction.customer.name] = {
              amount: Math.abs(transaction.amount),
              color: transaction.customer.color,
            };
          }
          break;
        }
        case "Swish": {
          const swishKey = "Swish";
          const prev = acc[swishKey];
          if (prev) {
            acc[swishKey] = {
              ...prev,
              amount: prev.amount + Math.abs(transaction.amount),
            };
          } else {
            acc[swishKey] = {
              amount: Math.abs(transaction.amount),
              color: "#55ffad",
            };
          }
          break;
        }
        case "Internal": {
          const prev = acc[transaction.otherAccount.name];
          if (prev) {
            acc[transaction.otherAccount.name] = {
              ...prev,
              amount: prev.amount + Math.abs(transaction.amount),
            };
          } else {
            acc[transaction.otherAccount.name] = {
              amount: Math.abs(transaction.amount),
              color: "#5545ad",
            };
          }
          break;
        }
      }

      return acc;
    }, {} as Record<string, { amount: number; color: string }>);

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value: value.amount,
      color: value.color,
    }));
  }, [expenses]);

  console.log(companyData, categoryData);

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full min-h-screen">
      <h1>Transactions</h1>
      <div className="flex flex-row justify-center items-center gap-4">
        <Label>From</Label>
        <DatePicker date={from} setDate={setFrom} />
        <Label>To</Label>
        <DatePicker date={to} setDate={setTo} />
      </div>
      <Separator />
      <p>
        Total income:{" "}
        {formatSEK(income.reduce((acc, curr) => acc + curr.amount, 0))}
      </p>
      <div className="flex flex-wrap flex-grow justify-start gap-8 w- w-full h-full">
        <ChartContainer style={{ minWidth: 200, minHeight: 200 }} config={{}}>
          <PieChart width={200} height={200}>
            <Pie
              dataKey="value"
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              label={(a) => `${a.name} ${formatSEK(a.value)}`}
            >
              {categoryData.map((d, index) => (
                <Cell key={`cell-${index}`} fill={d.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartContainer>

        <ChartContainer style={{ minWidth: 200, minHeight: 200 }} config={{}}>
          <PieChart width={200} height={200}>
            <Pie
              dataKey="value"
              data={companyData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#82ca9d"
              label={(a) => `${a.name} ${formatSEK(a.value)}`}
            >
              {companyData.map((d, index) => (
                <Cell key={`cell-${index}`} fill={d.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}

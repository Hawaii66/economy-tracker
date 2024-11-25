"use client";

import { Transaction } from "../../../types/transaction";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import { Customer } from "../../../types/customer";
import { uuidToPastelColor } from "@/lib/format";

type Props = {
  transactions: Transaction[];
  customers: Customer[];
};

export default function PerCustomer({ transactions, customers }: Props) {
  const a = new Map<string, number>();
  transactions.forEach((t) => {
    if (!t.customer) return;

    a.set(t.customer.id, (a.get(t.customer.id) ?? 0) + 1);
  });

  const config: Record<string, { label: string; color: string }> =
    customers.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.id]: {
          label: curr.name,
          color: curr.category.color,
        },
      }),
      {}
    ) satisfies ChartConfig;

  const data = Array.from(a).map((i) => ({
    label: i[0],
    num: i[1],
    fill: uuidToPastelColor(i[0]),
  }));

  return (
    <ChartContainer
      config={config}
      className="mx-auto h-[250px] max-h-[250px] aspect-square"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="num"
          nameKey="label"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="font-bold text-3xl fill-foreground"
                    >
                      {customers.length}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Customers
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

"use client";

import { Transaction } from "../../../types/transaction";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import { Category } from "../../../types/category";

type Props = {
  transactions: Transaction[];
  categories: Category[];
};

export default function PerCategory({ transactions, categories }: Props) {
  const a = new Map<string, number>();
  transactions.forEach((t) => {
    a.set(t.category.id, (a.get(t.category.id) ?? 0) + 1);
  });

  const config: Record<string, { label: string; color: string }> =
    categories.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.id]: {
          label: curr.name,
          color: curr.color,
        },
      }),
      {}
    ) satisfies ChartConfig;

  const data = Array.from(a).map((i) => ({
    label: i[0],
    num: i[1],
    fill: config[i[0]].color,
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
                      {transactions.length}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Transactions
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

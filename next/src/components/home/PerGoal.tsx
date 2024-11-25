"use client";

import {
  RadialBarChart,
  PolarGrid,
  RadialBar,
  ResponsiveContainer,
} from "recharts";
import { Category } from "../../../types/category";
import { Transaction } from "../../../types/transaction";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { formatCentSEK } from "@/lib/format";

type Props = {
  transactions: Transaction[];
  categories: Category[];
};

export default function PerGoal({ categories, transactions }: Props) {
  const config = categories.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.id]: {
        label: curr.name,
        color: curr.color,
      },
    }),
    {}
  ) satisfies ChartConfig;

  const map = new Map<string, number>();
  transactions.forEach((t) => {
    map.set(t.category.id, (map.get(t.category.id) ?? 0) + t.amount / 100);
  });

  const data = categories.map((category) => {
    const actual = map.get(category.id) ?? 0;
    const expected = 2000;

    return {
      category: category.name,
      display: actual * 100,
      actual: Math.min(Math.abs(actual) / expected, 1),
      fill: category.color,
    };
  });
  data.push({
    category: "",
    display: 0,
    actual: 1,
    fill: "#00000000",
  });

  return (
    <ResponsiveContainer>
      <ChartContainer config={config}>
        <RadialBarChart data={data} innerRadius={30} outerRadius={200}>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                nameKey="category"
                formatter={(value, name, props) =>
                  `${props.payload.category}: ${formatCentSEK(
                    props.payload.display
                  )}`
                }
              />
            }
          />
          <PolarGrid gridType="circle" />
          <RadialBar dataKey="actual" />
        </RadialBarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}

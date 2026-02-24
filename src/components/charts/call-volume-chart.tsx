"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  calls: {
    label: "Calls",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export interface CallVolumeData {
  label: string;
  calls: number;
}

// Simplified controlled component
export function CallVolumeChart({ data, title = "Call Volume" }: { data: CallVolumeData[]; title?: string }) {
  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-calls)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-calls)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              stroke="var(--muted-foreground)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              stroke="var(--muted-foreground)"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="calls"
              stroke="var(--color-calls)"
              strokeWidth={2}
              fill="url(#fillCalls)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

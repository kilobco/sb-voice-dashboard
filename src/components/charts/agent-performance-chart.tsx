"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const weekData = [
  { day: "Mon", resolved: 65, escalated: 12 },
  { day: "Tue", resolved: 78, escalated: 8 },
  { day: "Wed", resolved: 82, escalated: 15 },
  { day: "Thu", resolved: 70, escalated: 10 },
  { day: "Fri", resolved: 90, escalated: 6 },
  { day: "Sat", resolved: 45, escalated: 4 },
  { day: "Sun", resolved: 30, escalated: 2 },
];

const monthData = [
  { day: "Wk 1", resolved: 420, escalated: 55 },
  { day: "Wk 2", resolved: 480, escalated: 42 },
  { day: "Wk 3", resolved: 510, escalated: 38 },
  { day: "Wk 4", resolved: 530, escalated: 30 },
];

const chartConfig = {
  resolved: {
    label: "Resolved",
    color: "var(--chart-1)",
  },
  escalated: {
    label: "Escalated",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function AgentPerformanceChart() {
  const [period, setPeriod] = useState("week");
  const data = period === "week" ? weekData : monthData;

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Agent Performance</CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mb-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--chart-1)" }} />
            <span className="text-xs text-muted-foreground">Resolved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--chart-4)" }} />
            <span className="text-xs text-muted-foreground">Escalated</span>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[248px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="day"
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
            <Bar
              dataKey="resolved"
              fill="var(--color-resolved)"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Bar
              dataKey="escalated"
              fill="var(--color-escalated)"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

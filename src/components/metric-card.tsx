import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendDir: "positive" | "negative" | "neutral";
  period: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function MetricCard({
  title,
  value,
  trend,
  trendDir,
  period,
  icon: Icon,
  iconColor,
  iconBg,
}: MetricCardProps) {
  return (
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-full", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              trendDir === "positive" && "text-emerald-600",
              trendDir === "negative" && "text-red-500",
              trendDir === "neutral" && "text-muted-foreground"
            )}
          >
            {trend}
          </span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
      </CardContent>
    </Card>
  );
}

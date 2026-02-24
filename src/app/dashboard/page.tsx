import { createAdminClient } from "@/lib/supabase/admin";
import { MetricCard } from "@/components/metric-card";
import { CallVolumeChart } from "@/components/charts/call-volume-chart";
import { SalesVolumeChart } from "@/components/charts/sales-volume-chart";
import { RecentCallsTable } from "@/components/recent-calls-table";
import { Phone, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/app/actions/get-dashboard-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MetricsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const params = await searchParams; // Next.js 15+ searchParams is async
    const range = (params.range === "7days" ? "7days" : "today") as "today" | "7days";

    const dashboardData = await getDashboardData(range);

    if (!dashboardData) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-500">Error</h1>
                <p>Could not load dashboard data. Please check configuration.</p>
            </div>
        );
    }

    const { restaurantName, metrics, chartData, chartDataSales, recentCalls, popularItems } = dashboardData;

    // Metrics formatting
    const formattedTotalSales = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(metrics.totalSales.value);
    const formattedAvgOrder = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(metrics.avgOrderValue.value);

    const periodLabel = range === "today" ? "vs yesterday" : "vs prev 7 days";

    return (
        <div className="space-y-8 p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hello, {restaurantName}</h1>
                    <p className="text-sm text-muted-foreground">
                        Here's your {range === "today" ? "performance for today" : "performance over the last 7 days"}
                    </p>
                </div>
                {/* Date Range Toggle */}
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Button variant={range === "today" ? "secondary" : "ghost"} size="sm" asChild className="h-8">
                        <Link href="/dashboard?range=today">Today</Link>
                    </Button>
                    <Button variant={range === "7days" ? "secondary" : "ghost"} size="sm" asChild className="h-8">
                        <Link href="/dashboard?range=7days">Last 7 Days</Link>
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    title="Total Sales"
                    value={formattedTotalSales}
                    trend={metrics.totalSales.trend}
                    trendDir={metrics.totalSales.trendDir}
                    period={periodLabel}
                    icon={DollarSign}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-100"
                />
                <MetricCard
                    title="Avg Order Value"
                    value={formattedAvgOrder}
                    trend={metrics.avgOrderValue.trend}
                    trendDir={metrics.avgOrderValue.trendDir}
                    period={periodLabel}
                    icon={ShoppingBag}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100"
                />
                <MetricCard
                    title="Total Calls"
                    value={metrics.totalCalls.value.toString()}
                    trend={metrics.totalCalls.trend}
                    trendDir={metrics.totalCalls.trendDir}
                    period={periodLabel}
                    icon={Phone}
                    iconColor="text-indigo-600"
                    iconBg="bg-indigo-100"
                />
                <MetricCard
                    title="Total Orders"
                    value={metrics.totalOrders.value.toString()}
                    trend={metrics.totalOrders.trend}
                    trendDir={metrics.totalOrders.trendDir}
                    period={periodLabel}
                    icon={TrendingUp}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-100"
                />
            </div>

            {/* Sales Chart Section */}
            <div className="grid gap-6">
                <SalesVolumeChart
                    data={chartDataSales}
                    title={range === "today" ? "Hourly Sales Volume" : "Daily Sales Volume"}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Main Call Chart */}
                <div className="lg:col-span-4">
                    <CallVolumeChart
                        data={chartData}
                        title={range === "today" ? "Hourly Call Volume" : "Daily Call Volume"}
                    />
                </div>

                {/* Popular Items */}
                <div className="lg:col-span-3">
                    <Card className="h-full border-border/40 shadow-sm">
                        <CardHeader>
                            <CardTitle>Popular Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {popularItems.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{item.name}</span>
                                        <span className="text-sm text-muted-foreground">{item.count} orders</span>
                                    </div>
                                ))}
                                {popularItems.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Calls */}
            <RecentCallsTable calls={recentCalls} />
        </div>
    );
}

"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface MetricTrend {
    value: number;
    trend: string;
    trendDir: "positive" | "negative" | "neutral";
}

export interface DashboardData {
    restaurantName: string;
    metrics: {
        totalSales: MetricTrend;
        avgOrderValue: MetricTrend;
        totalCalls: MetricTrend;
        totalOrders: MetricTrend;
    };
    chartData: {
        label: string; // "10 AM", "Jan 01", etc.
        calls: number;
    }[];
    chartDataSales: {
        label: string;
        sales: number;
    }[];
    recentCalls: any[];
    popularItems: { name: string; count: number }[];
}

// ─── Timezone helpers ─────────────────────────────────────────────────
// All chart labels & date boundaries use the restaurant's IANA timezone
// so the dashboard reads in the restaurant's local wall-clock time.

/** Get the hour (0-23) of a Date in the given IANA timezone. */
function getHourInTz(date: Date, tz: string): number {
    const h = parseInt(
        new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: 'numeric',
            hour12: false,
        }).format(date),
        10,
    );
    return h === 24 ? 0 : h; // Intl can return "24" for midnight
}

/** Get a short date label (e.g. "Feb 08") in the given timezone. */
function getDateLabelInTz(date: Date, tz: string): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        day: '2-digit',
        month: 'short',
    }).format(date);
}

/**
 * Return an ISO-8601 string representing midnight (start of day)
 * in the given timezone, optionally shifted by `daysAgo` days.
 *
 * Example: startOfDayIso('America/Chicago', 0)
 *   → midnight today in Chicago, expressed as a UTC ISO string.
 */
function startOfDayIso(tz: string, daysAgo = 0): string {
    const now = new Date();

    // 1. What date is it right now in the restaurant's timezone?
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
    const [y, m, d] = todayStr.split('-').map(Number);

    // 2. Build midnight-UTC for the target calendar date
    const targetMidnightUtc = new Date(Date.UTC(y, m - 1, d - daysAgo));

    // 3. Compute the UTC ↔ TZ offset at that instant so we can shift to
    //    real midnight-in-TZ expressed as a UTC timestamp.
    const utcRepr = new Date(targetMidnightUtc.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzRepr = new Date(targetMidnightUtc.toLocaleString('en-US', { timeZone: tz }));
    const offsetMs = utcRepr.getTime() - tzRepr.getTime();

    return new Date(targetMidnightUtc.getTime() + offsetMs).toISOString();
}

function calculateTrend(current: number, previous: number): { trend: string, trendDir: "positive" | "negative" | "neutral" } {
    if (previous === 0) {
        if (current === 0) return { trend: "0%", trendDir: "neutral" };
        return { trend: "+100%", trendDir: "positive" };
    }

    const change = ((current - previous) / previous) * 100;
    const trendDir = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
    const sign = change > 0 ? "+" : "";

    return {
        trend: `${sign}${change.toFixed(1)}%`,
        trendDir
    };
}

// ──────────────────────────────────────────────────────────────────────

export async function getDashboardData(range: "today" | "7days" = "today"): Promise<DashboardData | null> {
    const supabase = createAdminClient();
    const restaurantId = process.env.DEFAULT_RESTAURANT_ID;

    if (!restaurantId) {
        console.error("DEFAULT_RESTAURANT_ID is not set");
        return null;
    }

    // 1. Fetch Restaurant Details
    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("name, timezone")
        .eq("id", restaurantId)
        .single();

    const restaurantName = restaurant?.name || "Restaurant";
    const timezone = restaurant?.timezone || "America/Chicago";

    // 2. Determine Date Ranges
    let currentStartIso: string;
    let previousStartIso: string;

    if (range === "today") {
        currentStartIso = startOfDayIso(timezone, 0); // Today 00:00
        previousStartIso = startOfDayIso(timezone, 1); // Yesterday 00:00
    } else {
        currentStartIso = startOfDayIso(timezone, 6); // 6 days ago 00:00
        previousStartIso = startOfDayIso(timezone, 13); // 13 days ago 00:00
    }

    // 3. Fetch Calls (fetch all needed for both periods)
    const { data: calls } = await supabase
        .from("calls")
        .select("*, customers(phone_number)")
        .eq("restaurant_id", restaurantId)
        .gte("started_at", previousStartIso)
        .order("started_at", { ascending: false });

    const safeCalls = calls || [];

    // 4. Fetch Orders (fetch all needed for both periods)
    const { data: orders } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("restaurant_id", restaurantId)
        .gte("created_at", previousStartIso);

    const safeOrders = orders || [];
    const confirmedOrders = safeOrders.filter(o => o.status === "confirmed");

    // 5. Split Data into Periods
    const currentCalls = safeCalls.filter(c => (c.started_at || c.created_at) >= currentStartIso);
    const previousCalls = safeCalls.filter(c => (c.started_at || c.created_at) < currentStartIso);

    const currentOrders = safeOrders.filter(o => o.created_at >= currentStartIso);
    const previousOrders = safeOrders.filter(o => o.created_at < currentStartIso);

    const currentConfirmedOrders = confirmedOrders.filter(o => o.created_at >= currentStartIso);
    const previousConfirmedOrders = confirmedOrders.filter(o => o.created_at < currentStartIso);

    // 6. Calculate Metrics & Trends

    // Calls
    const totalCallsCurrent = currentCalls.length;
    const totalCallsPrevious = previousCalls.length;
    const callsTrend = calculateTrend(totalCallsCurrent, totalCallsPrevious);

    // Orders
    const totalOrdersCurrent = currentOrders.length;
    const totalOrdersPrevious = previousOrders.length;
    const ordersTrend = calculateTrend(totalOrdersCurrent, totalOrdersPrevious);

    // Sales
    const totalSalesCurrent = currentConfirmedOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    const totalSalesPrevious = previousConfirmedOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    const salesTrend = calculateTrend(totalSalesCurrent, totalSalesPrevious);

    // Avg Order Value
    const countCurrent = currentConfirmedOrders.length;
    const countPrevious = previousConfirmedOrders.length;
    const avgOrderCurrent = countCurrent > 0 ? totalSalesCurrent / countCurrent : 0;
    const avgOrderPrevious = countPrevious > 0 ? totalSalesPrevious / countPrevious : 0;
    const avgOrderTrend = calculateTrend(avgOrderCurrent, avgOrderPrevious);

    // 7. Chart Data Preparation (Use only current period data)
    let chartData: { label: string; calls: number }[] = [];
    let chartDataSales: { label: string; sales: number }[] = [];

    if (range === "today") {
        // --- HOURLY BUCKETS (00 - 23) in restaurant's timezone ---
        const hours = Array.from({ length: 24 }, (_, i) => i);

        const callBuckets: Record<number, number> = {};
        const salesBuckets: Record<number, number> = {};
        hours.forEach(h => { callBuckets[h] = 0; salesBuckets[h] = 0; });

        // Bucket calls by local hour (Current Period Only)
        currentCalls.forEach(call => {
            const hour = getHourInTz(new Date(call.started_at || call.created_at), timezone);
            callBuckets[hour] += 1;
        });

        // Bucket confirmed-order sales by local hour (Current Period Only)
        currentConfirmedOrders.forEach(order => {
            const hour = getHourInTz(new Date(order.created_at), timezone);
            salesBuckets[hour] += Number(order.total_amount) || 0;
        });

        chartData = hours.map(h => {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return { label: `${h12} ${ampm}`, calls: callBuckets[h] };
        });

        chartDataSales = hours.map(h => {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return { label: `${h12} ${ampm}`, sales: salesBuckets[h] };
        });

    } else {
        // --- DAILY BUCKETS (Last 7 Days) in restaurant's timezone ---
        const dates: string[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            dates.push(getDateLabelInTz(d, timezone));
        }

        const callBuckets: Record<string, number> = {};
        const salesBuckets: Record<string, number> = {};
        dates.forEach(date => { callBuckets[date] = 0; salesBuckets[date] = 0; });

        currentCalls.forEach(call => {
            const dateStr = getDateLabelInTz(new Date(call.started_at || call.created_at), timezone);
            if (callBuckets[dateStr] !== undefined) callBuckets[dateStr] += 1;
        });

        currentConfirmedOrders.forEach(order => {
            const dateStr = getDateLabelInTz(new Date(order.created_at), timezone);
            if (salesBuckets[dateStr] !== undefined) salesBuckets[dateStr] += Number(order.total_amount) || 0;
        });

        chartData = dates.map(date => ({ label: date, calls: callBuckets[date] }));
        chartDataSales = dates.map(date => ({ label: date, sales: salesBuckets[date] }));
    }

    // 8. Popular Items (Current Period Only)
    const itemCounts: Record<string, number> = {};
    currentOrders.forEach(order => {
        if (order.order_items) {
            order.order_items.forEach((item: any) => {
                const name = item.item_name || "Unknown Item";
                itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
            });
        }
    });

    const popularItems = Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // 9. Recent Calls (Current Period Only) — formatted in restaurant's local timezone
    const recentCalls = currentCalls.slice(0, 5).map(call => {
        const customerPhone = call.customers?.phone_number;
        const displayPhone = call.caller_phone || customerPhone || "Unknown";

        // Find linked order
        // Strategy 1: Direct link via call_id
        let matchedOrder = currentOrders.find(o => o.call_id === call.id);

        // Strategy 2: Heuristic (Same customer + created within 10 mins of call start)
        if (!matchedOrder && call.customer_id) {
            const callStart = new Date(call.started_at || call.created_at).getTime();
            matchedOrder = currentOrders.find(o => {
                if (o.customer_id !== call.customer_id) return false;
                const orderTime = new Date(o.created_at).getTime();
                // Check if order was created between call start and call start + 15 mins
                return orderTime >= callStart && orderTime <= callStart + 15 * 60 * 1000;
            });
        }

        return {
            id: call.id,
            caller: displayPhone,
            agent: "AI Agent",
            duration: call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : "0s",
            status: call.status,
            time: new Date(call.started_at || call.created_at).toLocaleString('en-US', {
                timeZone: timezone,
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            }),
            order: matchedOrder ? (() => {
                const items = matchedOrder.order_items?.map((i: any) => ({
                    name: i.item_name,
                    quantity: i.quantity || 1,
                    price: Number(i.unit_price) || 0
                })) || [];
                const itemsTotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
                return {
                    id: matchedOrder.id,
                    total: Number(matchedOrder.total_amount) || itemsTotal,
                    items,
                };
            })() : null
        };
    });

    return {
        restaurantName,
        metrics: {
            totalSales: { value: totalSalesCurrent, ...salesTrend },
            avgOrderValue: { value: avgOrderCurrent, ...avgOrderTrend },
            totalCalls: { value: totalCallsCurrent, ...callsTrend },
            totalOrders: { value: totalOrdersCurrent, ...ordersTrend },
        },
        chartData,
        chartDataSales,
        recentCalls,
        popularItems,
    };
}

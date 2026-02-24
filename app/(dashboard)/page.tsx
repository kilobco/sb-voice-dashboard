import { getOverviewStats, getRecentCalls, getRecentOrders } from '@/lib/queries/overview'
import { StatCards } from '@/components/overview/stat-cards'
import { RecentCallsTable } from '@/components/overview/recent-calls-table'
import { RecentOrdersTable } from '@/components/overview/recent-orders-table'

export const revalidate = 30

export default async function OverviewPage() {
  const [stats, recentCalls, recentOrders] = await Promise.all([
    getOverviewStats(),
    getRecentCalls(),
    getRecentOrders(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Your restaurant at a glance</p>
      </div>
      <StatCards stats={stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentCallsTable calls={recentCalls} />
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </div>
  )
}

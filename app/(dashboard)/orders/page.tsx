import { getOrders } from '@/lib/queries/orders'
import { OrdersTable } from '@/components/orders/orders-table'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(0, parseInt(pageParam ?? '0', 10))
  const { orders, total } = await getOrders(page)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">{total} total orders</p>
      </div>
      <OrdersTable orders={orders} total={total} page={page} />
    </div>
  )
}

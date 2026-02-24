import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPhone, formatCurrency, formatRelativeTime, STATUS_COLORS, statusLabel } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RecentOrdersTable({ orders }: { orders: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Link href="/orders" className="text-sm text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/orders/${order.id}`} className="hover:underline text-primary text-sm">
                    {order.customers?.name ?? formatPhone(order.customers?.phone_number ?? null)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[order.status]}>{statusLabel(order.status)}</Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">{formatCurrency(order.total_amount)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatRelativeTime(order.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

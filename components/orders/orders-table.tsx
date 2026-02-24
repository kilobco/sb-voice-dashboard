'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPhone, formatCurrency, formatRelativeTime, STATUS_COLORS, statusLabel } from '@/lib/utils'
import { PAGE_SIZE } from '@/lib/queries/orders'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OrdersTable({ orders, total, page }: { orders: any[]; total: number; page: number }) {
  const router = useRouter()
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Instructions</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">No orders found</TableCell>
              </TableRow>
            )}
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <TableCell className="text-sm font-medium">
                  {order.customers?.name ?? formatPhone(order.customers?.phone_number ?? null)}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[order.status]}>{statusLabel(order.status)}</Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">{formatCurrency(order.total_amount)}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {order.special_instructions ?? '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatRelativeTime(order.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page + 1} of {totalPages} ({total} total)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => router.push(`/orders?page=${page - 1}`)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => router.push(`/orders?page=${page + 1}`)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

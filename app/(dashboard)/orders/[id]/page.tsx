import { notFound } from 'next/navigation'
import { getOrderDetail } from '@/lib/queries/orders'
import { OrderItemsTable } from '@/components/orders/order-items-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPhone, formatCurrency, formatDateTime, formatDuration, STATUS_COLORS, statusLabel } from '@/lib/utils'
import { User, Phone, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderDetail(id)
  if (!order) notFound()

  const orderItems = (order.order_items ?? []) as Array<{
    id: string
    item_name: string
    quantity: number
    unit_price: number
    customizations: Record<string, unknown> | null
    created_at: string
    menu_items?: { id: string; name: string; category: string | null } | null
  }>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Detail</h1>
          <p className="text-muted-foreground font-mono text-sm">{order.id}</p>
        </div>
        <Badge className={STATUS_COLORS[order.status]}>{statusLabel(order.status)}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><User className="h-4 w-4" /> Customer</div>
            <div className="font-medium">{order.customers?.name ?? 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">{formatPhone(order.customers?.phone_number ?? null)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Calendar className="h-4 w-4" /> Placed</div>
            <div className="font-medium">{formatDateTime(order.created_at)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Phone className="h-4 w-4" /> Linked Call</div>
            {order.calls ? (
              <>
                <Link href={`/calls/${order.calls.id}`} className="font-medium text-primary hover:underline text-sm">
                  View call →
                </Link>
                <div className="text-sm text-muted-foreground">
                  {formatPhone(order.calls.caller_phone)} · {formatDuration(order.calls.duration_seconds)}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-sm">No linked call</div>
            )}
          </CardContent>
        </Card>
      </div>

      {order.special_instructions && (
        <Card>
          <CardHeader><CardTitle>Special Instructions</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">{order.special_instructions}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Items</CardTitle>
            <span className="text-lg font-bold">{formatCurrency(order.total_amount)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <OrderItemsTable items={orderItems} />
        </CardContent>
      </Card>
    </div>
  )
}

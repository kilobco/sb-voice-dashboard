import { notFound } from 'next/navigation'
import { getCallDetail } from '@/lib/queries/calls'
import { TranscriptViewer } from '@/components/calls/transcript-viewer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPhone, formatDuration, formatDateTime, STATUS_COLORS, statusLabel, formatCurrency } from '@/lib/utils'
import { Phone, Clock, User, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default async function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { call, transcript } = await getCallDetail(id)
  if (!call) notFound()

  const orders = (call.orders ?? []) as Array<{
    id: string
    status: string
    total_amount: number | null
    special_instructions: string | null
    order_items: Array<{ id: string; item_name: string; quantity: number; unit_price: number }>
  }>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Call Detail</h1>
          <p className="text-muted-foreground font-mono text-sm">{call.id}</p>
        </div>
        <Badge className={STATUS_COLORS[call.status]}>{statusLabel(call.status)}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Phone className="h-4 w-4" /> Caller</div>
            <div className="font-medium">{formatPhone(call.caller_phone)}</div>
            {call.customers?.name && <div className="text-sm text-muted-foreground">{call.customers.name}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Clock className="h-4 w-4" /> Duration</div>
            <div className="font-medium">{formatDuration(call.duration_seconds)}</div>
            <div className="text-sm text-muted-foreground">{formatDateTime(call.started_at)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><User className="h-4 w-4" /> Customer</div>
            <div className="font-medium">{call.customers?.name ?? 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">{formatPhone(call.customers?.phone_number ?? null)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><ShoppingBag className="h-4 w-4" /> Orders</div>
            <div className="font-medium">{orders.length} order{orders.length !== 1 ? 's' : ''}</div>
          </CardContent>
        </Card>
      </div>

      {orders.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Linked Orders</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/orders/${order.id}`} className="font-medium text-primary hover:underline text-sm font-mono">
                    {order.id.slice(0, 8)}…
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLORS[order.status]}>{statusLabel(order.status)}</Badge>
                    <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground space-y-0.5">
                  {order.order_items?.map((item) => (
                    <li key={item.id}>{item.quantity}× {item.item_name} — {formatCurrency(item.unit_price)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Transcript</CardTitle></CardHeader>
        <CardContent>
          <TranscriptViewer entries={transcript} />
        </CardContent>
      </Card>
    </div>
  )
}

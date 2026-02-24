'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPhone, formatDuration, formatRelativeTime, STATUS_COLORS, statusLabel } from '@/lib/utils'
import { PAGE_SIZE } from '@/lib/queries/calls'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CallsTable({ calls, total, page }: { calls: any[]; total: number; page: number }) {
  const router = useRouter()
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caller</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No calls found</TableCell>
              </TableRow>
            )}
            {calls.map((call) => {
              const order = call.orders?.[0]
              return (
                <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/calls/${call.id}`)}>
                  <TableCell className="font-medium text-sm">{formatPhone(call.caller_phone)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[call.status]}>{statusLabel(call.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDuration(call.duration_seconds)}</TableCell>
                  <TableCell className="text-sm">{call.customers?.name ?? '—'}</TableCell>
                  <TableCell>
                    {order ? (
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Badge className={STATUS_COLORS[order.status]}>{statusLabel(order.status)}</Badge>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatRelativeTime(call.started_at)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page + 1} of {totalPages} ({total} total)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => router.push(`/calls?page=${page - 1}`)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => router.push(`/calls?page=${page + 1}`)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

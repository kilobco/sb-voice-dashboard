import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPhone, formatDuration, formatRelativeTime, STATUS_COLORS, statusLabel } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RecentCallsTable({ calls }: { calls: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Calls</CardTitle>
        <Link href="/calls" className="text-sm text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caller</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No calls yet</TableCell></TableRow>
            )}
            {calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell>
                  <Link href={`/calls/${call.id}`} className="hover:underline text-primary text-sm">
                    {call.customers?.name ?? formatPhone(call.caller_phone)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[call.status]}>{statusLabel(call.status)}</Badge>
                </TableCell>
                <TableCell className="text-sm">{formatDuration(call.duration_seconds)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatRelativeTime(call.started_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPhone, formatDateTime } from '@/lib/utils'

interface CustomerRow {
  id: string
  phone_number: string
  name: string | null
  created_at: string
  call_count: number
  order_count: number
}

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Calls</TableHead>
            <TableHead className="text-right">Orders</TableHead>
            <TableHead>First Seen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-10">No customers yet</TableCell>
            </TableRow>
          )}
          {customers.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium text-sm">{c.name ?? 'Unknown'}</TableCell>
              <TableCell className="text-sm">{formatPhone(c.phone_number)}</TableCell>
              <TableCell className="text-right text-sm">{c.call_count}</TableCell>
              <TableCell className="text-right text-sm">{c.order_count}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDateTime(c.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

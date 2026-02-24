import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface OrderItem {
  id: string
  item_name: string
  quantity: number
  unit_price: number
  customizations: Record<string, unknown> | null
  menu_items?: { id: string; name: string; category: string | null } | null
}

export function OrderItemsTable({ items }: { items: OrderItem[] }) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm text-center py-4">No items</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="font-medium text-sm">{item.item_name}</div>
              {item.customizations && Object.keys(item.customizations).length > 0 && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {Object.entries(item.customizations).map(([k, v]) => (
                    <span key={k} className="mr-2">{k}: {String(v)}</span>
                  ))}
                </div>
              )}
            </TableCell>
            <TableCell>
              {item.menu_items?.category ? (
                <Badge variant="secondary" className="text-xs">{item.menu_items.category}</Badge>
              ) : '—'}
            </TableCell>
            <TableCell className="text-right text-sm">{item.quantity}</TableCell>
            <TableCell className="text-right text-sm">{formatCurrency(item.unit_price)}</TableCell>
            <TableCell className="text-right text-sm font-medium">{formatCurrency(item.quantity * item.unit_price)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

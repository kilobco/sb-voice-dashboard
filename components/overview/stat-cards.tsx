import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, ShoppingBag, DollarSign, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Stats {
  callsToday: number
  activeOrders: number
  totalRevenue: number
  customerCount: number
}

export function StatCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: 'Calls Today',
      value: stats.callsToday.toString(),
      icon: Phone,
      description: 'Inbound calls since midnight',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders.toString(),
      icon: ShoppingBag,
      description: 'In-progress or confirmed',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      description: 'From completed orders',
    },
    {
      title: 'Customers',
      value: stats.customerCount.toString(),
      icon: Users,
      description: 'Unique callers on record',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

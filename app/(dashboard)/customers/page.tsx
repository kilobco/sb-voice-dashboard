import { getCustomers } from '@/lib/queries/customers'
import { CustomersTable } from '@/components/customers/customers-table'

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">{customers.length} customers who have called</p>
      </div>
      <CustomersTable customers={customers} />
    </div>
  )
}

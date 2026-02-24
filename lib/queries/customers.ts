import { createClient } from '@/lib/supabase/server'

export async function getCustomers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('customers')
    .select(`
      id, phone_number, name, preferences, created_at,
      calls ( count ),
      orders ( count )
    `)
    .order('created_at', { ascending: false })

  return (data ?? []).map((c) => ({
    ...c,
    call_count: (c.calls as unknown as [{ count: number }])?.[0]?.count ?? 0,
    order_count: (c.orders as unknown as [{ count: number }])?.[0]?.count ?? 0,
  }))
}

import { createClient } from '@/lib/supabase/server'

export const PAGE_SIZE = 20

export async function getOrders(page = 0) {
  const supabase = await createClient()
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, count } = await supabase
    .from('orders')
    .select(
      `
      id, status, total_amount, special_instructions, created_at, updated_at,
      customers ( id, phone_number, name ),
      calls ( id, status, caller_phone )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  return { orders: data ?? [], total: count ?? 0 }
}

export async function getOrderDetail(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      customers ( * ),
      calls ( id, status, caller_phone, started_at, duration_seconds ),
      order_items (
        id, item_name, quantity, unit_price, customizations, created_at,
        menu_items ( id, name, category )
      )
    `)
    .eq('id', id)
    .single()

  return data
}

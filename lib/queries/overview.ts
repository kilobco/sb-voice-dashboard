import { createClient } from '@/lib/supabase/server'
import { startOfDay } from 'date-fns'

export async function getOverviewStats() {
  const supabase = await createClient()
  const todayISO = startOfDay(new Date()).toISOString()

  const [callsToday, activeOrders, allOrders, customerCount] = await Promise.all([
    supabase
      .from('calls')
      .select('id', { count: 'exact', head: true })
      .gte('started_at', todayISO),

    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['in_progress', 'confirmed']),

    supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed'),

    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true }),
  ])

  const totalRevenue = (allOrders.data ?? []).reduce(
    (sum, o) => sum + (o.total_amount ?? 0),
    0
  )

  return {
    callsToday: callsToday.count ?? 0,
    activeOrders: activeOrders.count ?? 0,
    totalRevenue,
    customerCount: customerCount.count ?? 0,
  }
}

export async function getRecentCalls() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('calls')
    .select(`
      id, caller_phone, status, duration_seconds, started_at,
      customers ( id, phone_number, name ),
      orders ( id, status, total_amount )
    `)
    .order('started_at', { ascending: false })
    .limit(10)
  return data ?? []
}

export async function getRecentOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      id, status, total_amount, created_at,
      customers ( id, phone_number, name ),
      calls ( id, status )
    `)
    .order('created_at', { ascending: false })
    .limit(10)
  return data ?? []
}

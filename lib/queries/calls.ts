import { createClient } from '@/lib/supabase/server'

export const PAGE_SIZE = 20

export async function getCalls(page = 0) {
  const supabase = await createClient()
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, count } = await supabase
    .from('calls')
    .select(
      `
      id, caller_phone, status, duration_seconds, started_at, ended_at,
      customers ( id, phone_number, name ),
      orders ( id, status, total_amount )
    `,
      { count: 'exact' }
    )
    .order('started_at', { ascending: false })
    .range(from, to)

  return { calls: data ?? [], total: count ?? 0 }
}

export async function getCallDetail(id: string) {
  const supabase = await createClient()

  const [callRes, transcriptRes] = await Promise.all([
    supabase
      .from('calls')
      .select(`
        *,
        customers ( * ),
        orders (
          id, status, total_amount, special_instructions,
          order_items ( id, item_name, quantity, unit_price, customizations )
        )
      `)
      .eq('id', id)
      .single(),

    supabase
      .from('call_transcript_entries')
      .select('*')
      .eq('call_id', id)
      .order('created_at', { ascending: true }),
  ])

  return {
    call: callRes.data,
    transcript: transcriptRes.data ?? [],
  }
}

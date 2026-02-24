import { createClient } from '@/lib/supabase/server'

export async function getMenuItems() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('menu_items')
    .select(
      'id, restaurant_id, name, category, price, description, tags, is_available, created_at, updated_at'
    )
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return data ?? []
}

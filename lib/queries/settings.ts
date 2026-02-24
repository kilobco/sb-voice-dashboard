import { createClient } from '@/lib/supabase/server'

export async function getRestaurant() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('restaurants')
    .select('*')
    .single()

  return data
}

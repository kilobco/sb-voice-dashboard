'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateRestaurant(
  _prevState: { error: string; success: boolean } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const restaurantId = user?.app_metadata?.restaurant_id as string | undefined
  if (!restaurantId) return { error: 'Not authorized', success: false }

  let operating_hours: Record<string, unknown> = {}
  const hoursRaw = formData.get('operating_hours') as string
  if (hoursRaw) {
    try {
      operating_hours = JSON.parse(hoursRaw)
    } catch {
      return { error: 'Invalid operating hours JSON', success: false }
    }
  }

  const { error } = await supabase
    .from('restaurants')
    .update({
      name: formData.get('name') as string,
      address: (formData.get('address') as string) || null,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
      website: (formData.get('website') as string) || null,
      timezone: (formData.get('timezone') as string) || null,
      operating_hours,
    })
    .eq('id', restaurantId)

  if (error) return { error: error.message, success: false }

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
  return { error: '', success: true }
}

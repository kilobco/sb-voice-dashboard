'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getRestaurantId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const restaurantId = user?.app_metadata?.restaurant_id as string | undefined
  if (!restaurantId) throw new Error('Not authorized')
  return { supabase, restaurantId }
}

export async function createMenuItem(formData: FormData) {
  const { supabase, restaurantId } = await getRestaurantId()

  const { error } = await supabase.from('menu_items').insert({
    restaurant_id: restaurantId,
    name: formData.get('name') as string,
    category: (formData.get('category') as string) || null,
    price: parseFloat(formData.get('price') as string),
    description: (formData.get('description') as string) || null,
    tags: (formData.get('tags') as string)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    is_available: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/menu')
  return { error: null }
}

export async function updateMenuItem(id: string, formData: FormData) {
  const { supabase } = await getRestaurantId()

  const { error } = await supabase
    .from('menu_items')
    .update({
      name: formData.get('name') as string,
      category: (formData.get('category') as string) || null,
      price: parseFloat(formData.get('price') as string),
      description: (formData.get('description') as string) || null,
      tags: (formData.get('tags') as string)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/menu')
  return { error: null }
}

export async function deleteMenuItem(id: string) {
  const { supabase } = await getRestaurantId()
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/menu')
  return { error: null }
}

export async function toggleMenuItemAvailability(id: string, isAvailable: boolean) {
  const { supabase } = await getRestaurantId()
  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: isAvailable })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/menu')
  return { error: null }
}

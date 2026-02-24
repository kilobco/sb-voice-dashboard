export type CallStatus = 'in_progress' | 'completed' | 'failed' | 'abandoned' | 'no_answer'
export type OrderStatus = 'in_progress' | 'confirmed' | 'cancelled' | 'completed'

export interface Restaurant {
  id: string
  name: string
  twilio_phone_number: string
  address: string | null
  timezone: string | null
  operating_hours: Record<string, { open: string; close: string; closed?: boolean }> | null
  is_active: boolean | null
  phone: string | null
  email: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  phone_number: string
  name: string | null
  preferences: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface Call {
  id: string
  restaurant_id: string
  customer_id: string | null
  twilio_call_sid: string | null
  twilio_stream_sid: string | null
  caller_phone: string | null
  restaurant_phone: string | null
  status: CallStatus
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  metadata: Record<string, unknown> | null
  created_at: string
  customers?: Pick<Customer, 'id' | 'phone_number' | 'name'> | null
  orders?: Array<Pick<Order, 'id' | 'status' | 'total_amount'>>
}

export interface CallTranscriptEntry {
  id: string
  call_id: string
  role: string
  content: string | null
  tool_name: string | null
  tool_args: Record<string, unknown> | null
  tool_result: Record<string, unknown> | null
  created_at: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  category: string | null
  price: number
  description: string | null
  tags: string[] | null
  is_available: boolean | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  restaurant_id: string
  customer_id: string | null
  call_id: string | null
  status: OrderStatus
  total_amount: number | null
  special_instructions: string | null
  created_at: string
  updated_at: string
  customers?: Pick<Customer, 'id' | 'phone_number' | 'name'> | null
  calls?: Pick<Call, 'id' | 'status' | 'caller_phone' | 'started_at' | 'duration_seconds'> | null
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  item_name: string
  quantity: number
  unit_price: number
  customizations: Record<string, unknown> | null
  created_at: string
  menu_items?: Pick<MenuItem, 'id' | 'name' | 'category'> | null
}

export interface CustomerWithCounts extends Customer {
  call_count: number
  order_count: number
}

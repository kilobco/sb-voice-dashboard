'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { updateRestaurant } from '@/actions/settings'
import { Restaurant } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
]

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save Changes'}
    </Button>
  )
}

export function SettingsForm({ restaurant }: { restaurant: Restaurant | null }) {
  const [state, formAction] = useActionState(updateRestaurant, null)

  useEffect(() => {
    if (state?.success) toast.success('Settings saved')
    if (state?.error) toast.error(state.error)
  }, [state])

  const defaultHours = JSON.stringify(restaurant?.operating_hours ?? {}, null, 2)

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Restaurant Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={restaurant?.name ?? ''} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={restaurant?.phone ?? ''} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={restaurant?.email ?? ''} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={restaurant?.address ?? ''} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" defaultValue={restaurant?.website ?? ''} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Hours & Timezone</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Select name="timezone" defaultValue={restaurant?.timezone ?? 'America/Chicago'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="operating_hours">
              Operating Hours{' '}
              <span className="text-muted-foreground text-xs font-normal">(JSON format)</span>
            </Label>
            <Textarea
              id="operating_hours"
              name="operating_hours"
              rows={8}
              defaultValue={defaultHours}
              className="font-mono text-sm"
              placeholder={'{\n  "monday": { "open": "11:00", "close": "22:00" },\n  "tuesday": { "open": "11:00", "close": "22:00" }\n}'}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />
      <div className="flex justify-end">
        <SaveButton />
      </div>
    </form>
  )
}

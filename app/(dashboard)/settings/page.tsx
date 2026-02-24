import { getRestaurant } from '@/lib/queries/settings'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
  const restaurant = await getRestaurant()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your restaurant profile</p>
      </div>
      <SettingsForm restaurant={restaurant} />
    </div>
  )
}

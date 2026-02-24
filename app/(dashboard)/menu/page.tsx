import { getMenuItems } from '@/lib/queries/menu'
import { MenuTable } from '@/components/menu/menu-table'

export default async function MenuPage() {
  const items = await getMenuItems()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
        <p className="text-muted-foreground">{items.length} items across all categories</p>
      </div>
      <MenuTable items={items} />
    </div>
  )
}

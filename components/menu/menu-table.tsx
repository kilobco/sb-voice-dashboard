'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { MenuItem } from '@/lib/types'
import { toggleMenuItemAvailability, deleteMenuItem } from '@/actions/menu'
import { MenuItemModal } from './menu-item-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Pencil, Trash2, Plus } from 'lucide-react'

export function MenuTable({ items }: { items: MenuItem[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [, startTransition] = useTransition()

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean) as string[]))]

  const filtered = items.filter((item) => {
    const matchSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || item.category === category
    return matchSearch && matchCategory
  })

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      const res = await toggleMenuItemAvailability(id, !current)
      if (res?.error) toast.error(res.error)
    })
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    startTransition(async () => {
      const res = await deleteMenuItem(id)
      if (res?.error) toast.error(res.error)
      else toast.success(`"${name}" deleted`)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => { setEditItem(null); setModalOpen(true) }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No items found
                </TableCell>
              </TableRow>
            )}
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium text-sm">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                  )}
                </TableCell>
                <TableCell>
                  {item.category ? (
                    <Badge variant="secondary">{item.category}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="font-medium text-sm">{formatCurrency(item.price)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(item.tags ?? []).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                    {(item.tags ?? []).length > 3 && (
                      <Badge variant="outline" className="text-xs">+{(item.tags ?? []).length - 3}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={item.is_available ?? true}
                    onCheckedChange={() => handleToggle(item.id, item.is_available ?? true)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditItem(item); setModalOpen(true) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id, item.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <MenuItemModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={editItem}
      />
    </div>
  )
}

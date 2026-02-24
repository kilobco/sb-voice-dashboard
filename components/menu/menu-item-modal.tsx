'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { MenuItem } from '@/lib/types'
import { createMenuItem, updateMenuItem } from '@/actions/menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface MenuItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: MenuItem | null
}

export function MenuItemModal({ open, onOpenChange, item }: MenuItemModalProps) {
  const [isPending, startTransition] = useTransition()
  const isEdit = !!item

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = isEdit
        ? await updateMenuItem(item.id, formData)
        : await createMenuItem(formData)

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(isEdit ? 'Item updated' : 'Item created')
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={item?.name ?? ''} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={item?.price ?? ''}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={item?.category ?? ''} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} defaultValue={item?.description ?? ''} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="tags">Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
              <Input id="tags" name="tags" defaultValue={(item?.tags ?? []).join(', ')} placeholder="vegan, spicy, gluten-free" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

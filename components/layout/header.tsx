'use client'

import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  restaurantName: string
}

export function Header({ restaurantName }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <span className="font-semibold">{restaurantName}</span>
      <form action={logout}>
        <Button variant="ghost" size="sm" type="submit" className="gap-2 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </form>
    </header>
  )
}

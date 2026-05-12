'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LifeBuoy } from 'lucide-react'

export const RESET_HOME_EVENT = 'rettich:reset-home'

export default function RettMichNavLink() {
  const pathname = usePathname()

  return (
    <Link
      href="/"
      onClick={() => {
        if (pathname === '/') {
          window.dispatchEvent(new Event(RESET_HOME_EVENT))
        }
      }}
      className="flex-1 flex flex-col items-center gap-1 py-3 text-stone-500 hover:text-orange-600 transition-colors min-w-0"
    >
      <LifeBuoy size={22} className="shrink-0" />
      <span className="text-[11px] sm:text-xs text-center leading-tight">Rett:mich</span>
    </Link>
  )
}

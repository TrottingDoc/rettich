'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type LogoutButtonProps = {
  className?: string
  showLabel?: boolean
}

export default function LogoutButton({ className, showLabel = true }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={loading}
      className={cn(
        'flex items-center gap-1.5 text-sm text-stone-500 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-wait',
        className,
      )}
    >
      <LogOut size={16} />
      {showLabel && <span>{loading ? 'Abmelden…' : 'Abmelden'}</span>}
    </button>
  )
}

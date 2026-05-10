import Link from 'next/link'
import Image from 'next/image'
import { Plus, List } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-[#faf7f0] border-b border-stone-200/70 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-[3px]">
          <Image
            src="/image_rettich.png"
            alt="Rettich"
            width={72}
            height={72}
            priority
            className="object-contain"
          />
          <span className="font-bold text-xl text-stone-900">
            Rett<span className="font-bold text-red-600">:</span>ich Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
          >
            <List size={16} />
            Alle Rezepte
          </Link>
          <Link
            href="/admin/rezepte/neu"
            className="flex items-center gap-2 bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={16} />
            Neues Rezept
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

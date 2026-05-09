import Link from 'next/link'
import Image from 'next/image'
import { Home, Clock, User } from 'lucide-react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto bg-white">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-stone-200 px-6 py-3">
        <Link href="/" className="flex items-center gap-1.5 w-fit">
          <Image
            src="/image_rettich.png"
            alt="Rettich"
            width={40}
            height={40}
            priority
            className="object-contain"
          />
          <span className="font-bold text-2xl text-stone-900">
            Rett<span className="font-bold text-red-600">:</span>ich
          </span>
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-stone-200 flex">
        <Link
          href="/"
          className="flex-1 flex flex-col items-center gap-1 py-3 text-stone-500 hover:text-orange-600 transition-colors"
        >
          <Home size={22} />
          <span className="text-xs">Heute</span>
        </Link>
        <Link
          href="/verlauf"
          className="flex-1 flex flex-col items-center gap-1 py-3 text-stone-500 hover:text-orange-600 transition-colors"
        >
          <Clock size={22} />
          <span className="text-xs">Verlauf</span>
        </Link>
        <Link
          href="/profil"
          className="flex-1 flex flex-col items-center gap-1 py-3 text-stone-500 hover:text-orange-600 transition-colors"
        >
          <User size={22} />
          <span className="text-xs">Profil</span>
        </Link>
      </nav>
    </div>
  )
}

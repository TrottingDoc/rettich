import Link from 'next/link'
import Image from 'next/image'
import { Home, Clock, User } from 'lucide-react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto bg-white">
      <header className="sticky top-0 z-10 bg-[#faf7f0]/95 backdrop-blur border-b border-stone-200/70 px-6 pt-1.5 pb-2">
        <Link href="/" className="flex items-center gap-[3px] w-fit">
          <Image
            src="/image_rettich.png"
            alt="Rettich"
            width={80}
            height={80}
            priority
            className="object-contain shrink-0"
          />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-bold text-2xl text-stone-900 leading-tight">
              Rett<span className="font-bold text-red-600">:</span>ich
            </span>
            <span className="text-xs text-stone-500 leading-snug">
              Die einfach kochen App
            </span>
          </div>
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#faf7f0] border-t border-stone-200/70 flex">
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
          <span className="text-xs">Bisher</span>
        </Link>
        <Link
          href="/profil"
          className="flex-1 flex flex-col items-center gap-1 py-3 text-stone-500 hover:text-orange-600 transition-colors"
        >
          <User size={22} />
          <span className="text-xs">Vorlieben</span>
        </Link>
      </nav>
    </div>
  )
}

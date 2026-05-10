'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowRight, Lock } from 'lucide-react'

function getLoginErrorMessage(error: { code?: string; status?: number; message?: string }) {
  const message = error.message?.toLowerCase() ?? ''

  if (message.includes('invalid login credentials')) {
    return 'E-Mail oder Passwort stimmt nicht.'
  }

  if (message.includes('email not confirmed')) {
    return 'Dieses Konto ist noch nicht bestätigt.'
  }

  return 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setLoading(false)
      setError(getLoginErrorMessage(error))
      return
    }

    const { data: profile } = await supabase
      .from('profile')
      .select('onboarding_completed')
      .maybeSingle()

    router.replace(profile?.onboarding_completed ? '/' : '/onboarding')
    router.refresh()
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[#faf7f0] px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-0">
          <Image
            src="/image_rettich.png"
            alt="Rettich"
            width={160}
            height={160}
            priority
            className="object-contain"
          />
          <div className="text-center">
            <h1 className="font-bold text-3xl text-stone-900">
              Rett<span className="text-red-600">:</span>ich
            </h1>
            <p className="text-stone-500 text-sm mt-1">Die einfach kochen App</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col gap-4">
            <div>
              <h2 className="font-semibold text-stone-900 text-lg">Anmelden</h2>
              <p className="text-stone-500 text-sm mt-1">
                Melde dich mit deinem Rett:ich-Konto an.
              </p>
            </div>

            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                autoComplete="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Wird angemeldet…' : (
              <>
                Anmelden
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

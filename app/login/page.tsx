'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowRight, Check } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          app_name: 'Rett:ich',
          login_reason: 'Du hast einen Anmelde-Link für die Rett:ich App angefordert.',
        },
      },
    })

    setLoading(false)

    if (error) {
      setError('Es ist ein Fehler aufgetreten. Bitte versuche es erneut.')
      return
    }

    setSent(true)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[#faf7f0] px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-1.5">
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

        {sent ? (
          <div className="w-full bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={24} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-stone-900">Link verschickt!</p>
              <p className="text-stone-500 text-sm mt-1">
                Schau in dein Postfach bei <span className="font-medium text-stone-700">{email}</span> und klick auf den Link.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col gap-4">
              <div>
                <h2 className="font-semibold text-stone-900 text-lg">Anmelden</h2>
                <p className="text-stone-500 text-sm mt-1">
                  Gib deine E-Mail-Adresse ein. Wir schicken dir einen Anmelde-Link.
                </p>
              </div>

              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
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
              disabled={loading || !email.trim()}
              className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird gesendet…' : (
                <>
                  Link anfordern
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

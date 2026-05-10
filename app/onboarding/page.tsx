'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, Heart, Save } from 'lucide-react'
import { getProfile, saveProfile } from '@/lib/store'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ALLERGEN_OPTIONS, NOTIFICATION_HOURS } from '@/lib/profile-options'

function Toggle({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 text-base border rounded-xl px-4 py-3 transition-all active:scale-95 text-left',
        active
          ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
          : 'border-stone-200 text-stone-600 hover:border-stone-300',
      )}
    >
      {active && <Check size={16} className="text-orange-600 shrink-0" />}
      {label}
    </button>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const p = await getProfile()
        if (!cancelled) {
          setProfile({
            ...p,
            portions: p.portions || 2,
            maxTimeMinutes: p.maxTimeMinutes || 60,
          })
        }
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function toggleAllergen(id: string) {
    if (!profile) return
    const has = profile.allergies.includes(id)
    setProfile({
      ...profile,
      allergies: has ? profile.allergies.filter((a) => a !== id) : [...profile.allergies, id],
    })
  }

  async function submit() {
    if (!profile) return
    setSaving(true)
    try {
      await saveProfile({
        ...profile,
        portions: 2,
        maxTimeMinutes: 60,
        onboardingCompleted: true,
      })
      router.replace('/')
      router.refresh()
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#faf7f0]">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#faf7f0] px-5 py-8 flex justify-center">
      <main className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/image_rettich.png"
            alt="Rettich"
            width={72}
            height={72}
            priority
            className="object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-stone-900">
              Willkommen bei Rett<span className="text-red-600">:</span>ich
            </h1>
            <p className="text-stone-500 mt-2">
              Zwei kurze Fragen, damit deine Vorschläge direkt besser passen.
            </p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Heart size={24} className="text-orange-600 shrink-0 mt-0.5" aria-hidden />
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Folgende Lebensmittel mag ich nicht verwenden
              </h2>
              <p className="text-sm text-stone-500 mt-1 leading-snug">
                Tippe alles an, was für deine Vorschläge vermieden werden soll.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map(({ id, label }) => (
              <Toggle
                key={id}
                label={label}
                active={profile.allergies.includes(id)}
                onClick={() => toggleAllergen(id)}
              />
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">
              Wann soll dein täglicher Vorschlag kommen?
            </h2>
            <p className="text-sm text-stone-500 mt-1 leading-snug">
              Du kannst die Uhrzeit später im Profil ändern.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {NOTIFICATION_HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setProfile({ ...profile, notificationHour: h })}
                className={cn(
                  'px-4 py-2 rounded-full border text-base font-medium transition-all active:scale-95',
                  profile.notificationHour === h
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'border-stone-300 text-stone-600 hover:border-orange-400 bg-white',
                )}
              >
                {h}:00 Uhr
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-wait active:scale-95 transition-all"
        >
          <Save size={20} />
          {saving ? 'Speichern…' : 'Loslegen'}
        </button>
      </main>
    </div>
  )
}

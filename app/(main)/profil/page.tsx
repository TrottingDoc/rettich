'use client'

import { useEffect, useState } from 'react'
import { Save, Check, Heart } from 'lucide-react'
import { getProfile, saveProfile } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import LogoutButton from '@/components/LogoutButton'
import { ALLERGEN_OPTIONS, NOTIFICATION_HOURS } from '@/lib/profile-options'

const EQUIPMENT_OPTIONS = ['Herd', 'Backofen', 'Mikrowelle', 'Toaster', 'Wasserkocher', 'Mixer']

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
        'flex items-center gap-2 text-base border rounded-xl px-4 py-3 transition-all active:scale-95',
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

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saved, setSaved] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const p = await getProfile()
        if (!cancelled) setProfile(p)
      } catch (err) {
        console.error(err)
      }
    })()
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUserEmail(data.user?.email ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function save() {
    if (!profile) return
    try {
      await saveProfile(profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  function toggleEquipment(item: string) {
    if (!profile) return
    const has = profile.equipment.includes(item)
    setProfile({
      ...profile,
      equipment: has ? profile.equipment.filter((e) => e !== item) : [...profile.equipment, item],
    })
  }

  function toggleAllergen(id: string) {
    if (!profile) return
    const has = profile.allergies.includes(id)
    setProfile({
      ...profile,
      allergies: has ? profile.allergies.filter((a) => a !== id) : [...profile.allergies, id],
    })
  }

  if (!profile) return null

  return (
    <div className="px-4 pt-8 pb-6 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Heart size={28} className="text-orange-600 shrink-0 mt-1" aria-hidden />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-stone-900">Vorlieben</h1>
            <p className="text-stone-500 mt-1">Einmal ausfüllen, für immer passende Vorschläge.</p>
            {userEmail && (
              <p className="text-xs text-stone-400 mt-0.5 truncate">{userEmail}</p>
            )}
          </div>
        </div>
        <LogoutButton className="shrink-0 mt-1" />
      </div>

      {/* Zeit */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800 leading-snug">
          So lange darf das Kochen dauern
        </h2>
        <div className="flex flex-wrap gap-2">
          {[10, 15, 20, 30, 45, 60].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setProfile({ ...profile, maxTimeMinutes: t })}
              className={cn(
                'px-4 py-2 rounded-full border text-base font-medium transition-all active:scale-95',
                profile.maxTimeMinutes === t
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'border-stone-300 text-stone-600 hover:border-orange-400',
              )}
            >
              {t} Min.
            </button>
          ))}
        </div>
      </div>

      {/* Portionen */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800 leading-snug">
          Für so viele Leute koche ich
        </h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setProfile({ ...profile, portions: Math.max(1, profile.portions - 1) })}
            className="w-12 h-12 rounded-full border-2 border-stone-300 text-xl font-bold text-stone-700 hover:border-orange-500 transition-colors active:scale-95"
          >
            −
          </button>
          <span className="text-3xl font-bold text-stone-900 w-10 text-center">{profile.portions}</span>
          <button
            type="button"
            onClick={() => setProfile({ ...profile, portions: Math.min(8, profile.portions + 1) })}
            className="w-12 h-12 rounded-full border-2 border-stone-300 text-xl font-bold text-stone-700 hover:border-orange-500 transition-colors active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      {/* Allergene / Vermeiden */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-stone-800 leading-snug">
            Folgende Lebensmittel mag ich nicht verwenden
          </h2>
          <p className="text-sm text-stone-500 mt-1 leading-snug">
            Übliche Allergene und Unverträglichkeiten – tippe zum Markieren (mehrere möglich).
          </p>
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
      </div>

      {/* Geräte */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800 leading-snug">
          Das würde ich verwenden
        </h2>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((item) => (
            <Toggle
              key={item}
              label={item}
              active={profile.equipment.includes(item)}
              onClick={() => toggleEquipment(item)}
            />
          ))}
        </div>
      </div>

      {/* Vorschlagszeit */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800 leading-snug">
          Schick mir einen täglichen Vorschlag um:
        </h2>
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
                  : 'border-stone-300 text-stone-600 hover:border-orange-400',
              )}
            >
              {h}:00 Uhr
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={() => void save()}
        className={cn(
          'flex items-center justify-center gap-2 w-full font-semibold text-lg py-4 rounded-xl active:scale-95 transition-all',
          saved ? 'bg-green-600 text-white' : 'bg-orange-600 text-white hover:bg-orange-700',
        )}
      >
        {saved ? (
          <>
            <Check size={20} /> Gespeichert!
          </>
        ) : (
          <>
            <Save size={20} /> Speichern
          </>
        )}
      </button>
    </div>
  )
}

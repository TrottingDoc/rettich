'use client'

import { useEffect, useState } from 'react'
import { Save, Check } from 'lucide-react'
import { getProfile, saveProfile } from '@/lib/store'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

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

  useEffect(() => {
    setProfile(getProfile())
  }, [])

  function save() {
    if (!profile) return
    saveProfile(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function toggleEquipment(item: string) {
    if (!profile) return
    const has = profile.equipment.includes(item)
    setProfile({
      ...profile,
      equipment: has ? profile.equipment.filter((e) => e !== item) : [...profile.equipment, item],
    })
  }

  if (!profile) return null

  return (
    <div className="px-4 pt-8 pb-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Einstellungen</h1>
        <p className="text-stone-500 mt-1">Einmal ausfüllen, für immer passende Vorschläge.</p>
      </div>

      {/* Time */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800">⏱️ Wie viel Zeit hast du?</h2>
        <div className="flex flex-wrap gap-2">
          {[10, 15, 20, 30, 45, 60].map((t) => (
            <button
              key={t}
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

      {/* Portions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800">🍽️ Für wie viele Personen?</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setProfile({ ...profile, portions: Math.max(1, profile.portions - 1) })}
            className="w-12 h-12 rounded-full border-2 border-stone-300 text-xl font-bold text-stone-700 hover:border-orange-500 transition-colors active:scale-95"
          >
            −
          </button>
          <span className="text-3xl font-bold text-stone-900 w-10 text-center">{profile.portions}</span>
          <button
            onClick={() => setProfile({ ...profile, portions: Math.min(8, profile.portions + 1) })}
            className="w-12 h-12 rounded-full border-2 border-stone-300 text-xl font-bold text-stone-700 hover:border-orange-500 transition-colors active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      {/* Equipment */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800">🔧 Was hast du in der Küche?</h2>
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

      {/* Notification hour */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800">🔔 Wann soll ich vorschlagen?</h2>
        <div className="flex flex-wrap gap-2">
          {[8, 9, 10, 11, 12, 16, 17, 18].map((h) => (
            <button
              key={h}
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
        onClick={save}
        className={cn(
          'flex items-center justify-center gap-2 w-full font-semibold text-lg py-4 rounded-xl active:scale-95 transition-all',
          saved
            ? 'bg-green-600 text-white'
            : 'bg-orange-600 text-white hover:bg-orange-700',
        )}
      >
        {saved ? (
          <><Check size={20} /> Gespeichert!</>
        ) : (
          <><Save size={20} /> Speichern</>
        )}
      </button>
    </div>
  )
}

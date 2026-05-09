'use client'

import { useEffect, useState } from 'react'
import { Save, Check, Heart } from 'lucide-react'
import {
  createTodaySuggestion,
  getOrCreateSuggestionForDate,
  getSuggestionByDate,
  tomorrowStr,
  todayStr,
  getProfile,
  saveProfile,
} from '@/lib/store'
import type { DailySuggestion, Profile } from '@/lib/types'
import { cn, formatIngredientLine } from '@/lib/utils'

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
  const [todaySuggestion, setTodaySuggestion] = useState<DailySuggestion | null>(null)
  const [tomorrowSuggestion, setTomorrowSuggestion] = useState<DailySuggestion | null>(null)

  useEffect(() => {
    createTodaySuggestion()
    setTodaySuggestion(getSuggestionByDate(todayStr()))
    setProfile(getProfile())
  }, [])

  useEffect(() => {
    if (!profile?.shopDayAhead) {
      setTomorrowSuggestion(null)
      return
    }
    const next = getOrCreateSuggestionForDate(tomorrowStr())
    setTomorrowSuggestion(next)
  }, [profile?.shopDayAhead])

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

  function refreshTodaySuggestion() {
    createTodaySuggestion()
    setTodaySuggestion(getSuggestionByDate(todayStr()))
  }

  if (!profile) return null

  const todayRecipe = todaySuggestion?.recipe

  return (
    <div className="px-4 pt-8 pb-6 flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <Heart
          size={28}
          className="text-red-500 shrink-0 mt-1 fill-red-500"
          aria-hidden
        />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-stone-900">Vorlieben</h1>
          <p className="text-stone-500 mt-1">Einmal ausfüllen, für immer passende Vorschläge.</p>
        </div>
      </div>

      {/* Zeit */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800 leading-snug">
          So lange koche ich gerne (wenn es sein muss)
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
          Für so viele Leute koche ich gerne
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

      {/* Geräte */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800 leading-snug">
          Das benutze ich gerne in der Küche
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
          Um diese Zeit hätte ich den Vorschlag gerne
        </h2>
        <div className="flex flex-wrap gap-2">
          {[8, 9, 10, 11, 12, 16, 17, 18].map((h) => (
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

      {/* Einkaufsliste heute */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-stone-800 leading-snug flex-1">
            Eine Einkaufsliste hätte ich gern
          </h2>
          <label className="flex items-center gap-2 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.wantsShoppingList}
              onChange={(e) =>
                setProfile({ ...profile, wantsShoppingList: e.target.checked })
              }
              className="w-5 h-5 accent-orange-600 rounded border-stone-300"
            />
          </label>
        </div>
        <p className="text-sm text-stone-500">
          Alle Zutaten für dein heutiges Tagesgericht – zum Abhaken beim Einkaufen.
        </p>
        {profile.wantsShoppingList && (
          <>
            {!todayRecipe && (
              <p className="text-sm text-stone-500">
                Noch kein Vorschlag für heute – kurz auf die Startseite wechseln, dann hier aktualisieren.
              </p>
            )}
            {todayRecipe && (
              <>
                <p className="text-sm font-medium text-stone-700">{todayRecipe.title}</p>
                <ul className="flex flex-col gap-2 border-t border-stone-100 pt-4">
                  {todayRecipe.ingredients.map((ing, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-stone-800 text-base leading-snug"
                    >
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                      <span>{formatIngredientLine(ing)}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={refreshTodaySuggestion}
                  className="text-sm font-medium text-orange-700 hover:text-orange-800 self-start"
                >
                  Liste aktualisieren
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Tag vorher */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-stone-800 leading-snug flex-1">
            Manchmal will ich schon einen Tag vorher einkaufen
          </h2>
          <label className="flex items-center gap-2 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.shopDayAhead}
              onChange={(e) =>
                setProfile({ ...profile, shopDayAhead: e.target.checked })
              }
              className="w-5 h-5 accent-orange-600 rounded border-stone-300"
            />
          </label>
        </div>
        <p className="text-sm text-stone-500">
          Wenn aktiv: du siehst auf der Startseite schon den Vorschlag für morgen und kannst hier die
          Einkaufsliste dafür öffnen.
        </p>
        {profile.shopDayAhead && tomorrowSuggestion?.recipe && (
          <div className="border-t border-stone-100 pt-4 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Für morgen vorgemerkt
            </p>
            <p className="text-base font-semibold text-stone-900">{tomorrowSuggestion.recipe.title}</p>
            <p className="text-sm font-medium text-stone-700">Einkauf für morgen</p>
            <ul className="flex flex-col gap-2">
              {tomorrowSuggestion.recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-stone-800 text-base leading-snug"
                >
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                  <span>{formatIngredientLine(ing)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {profile.shopDayAhead && !tomorrowSuggestion?.recipe && (
          <p className="text-sm text-stone-500">
            Kein Rezept verfügbar – bitte im Admin aktive Rezepte anlegen.
          </p>
        )}
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={save}
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

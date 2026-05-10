'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, ShoppingCart } from 'lucide-react'
import {
  createTodaySuggestion,
  getOrCreateSuggestionForDate,
  getSuggestionByDate,
  refreshTomorrowSuggestion,
  tomorrowStr,
  todayStr,
} from '@/lib/store'
import type { DailySuggestion } from '@/lib/types'
import { formatIngredientLine } from '@/lib/utils'

export default function EinkaufenPage() {
  const [todaySuggestion, setTodaySuggestion] = useState<DailySuggestion | null>(null)
  const [tomorrowSuggestion, setTomorrowSuggestion] = useState<DailySuggestion | null>(null)

  async function refreshLists() {
    try {
      await createTodaySuggestion()
      const [today, tomorrow] = await Promise.all([
        getSuggestionByDate(todayStr()),
        getOrCreateSuggestionForDate(tomorrowStr()),
      ])
      setTodaySuggestion(today)
      setTomorrowSuggestion(tomorrow)
    } catch (err) {
      console.error(err)
    }
  }

  async function requestNewTomorrowSuggestion() {
    try {
      const next = await refreshTomorrowSuggestion()
      if (next) setTomorrowSuggestion(next)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        await createTodaySuggestion()
        const [today, tomorrow] = await Promise.all([
          getSuggestionByDate(todayStr()),
          getOrCreateSuggestionForDate(tomorrowStr()),
        ])
        if (!cancelled) {
          setTodaySuggestion(today)
          setTomorrowSuggestion(tomorrow)
        }
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const todayRecipe = todaySuggestion?.recipe

  return (
    <div className="px-4 pt-8 pb-6 flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <ShoppingCart
          size={28}
          className="text-orange-600 shrink-0 mt-1"
          aria-hidden
        />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-stone-900">Einkaufen</h1>
          <p className="text-stone-500 mt-1">
            Zutatenlisten für dein Tagesgericht – zum Abhaken beim Einkauf.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800 leading-snug">Für heute</h2>
        {!todayRecipe && (
          <p className="text-sm text-stone-500">
            Noch kein Vorschlag für heute – kurz auf „Heute“ gehen, dann hier aktualisieren.
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
          </>
        )}
        <button
          type="button"
          onClick={() => void refreshLists()}
          className="text-sm font-medium text-orange-700 hover:text-orange-800 self-start"
        >
          Liste aktualisieren
        </button>
      </div>

      <div className="rounded-xl border border-orange-200/80 bg-orange-50/90 p-5 flex flex-col gap-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-800/90">
            Schon für morgen einkaufen
          </p>
          <p className="text-sm text-stone-600 mt-2">
            Zutaten für den Vorschlag von morgen – ideal zum vorgezogenen Einkauf.
          </p>
        </div>
        {tomorrowSuggestion?.recipe && (
          <>
            <p className="text-base font-semibold text-stone-900 leading-snug">
              {tomorrowSuggestion.recipe.title}
            </p>
            <button
              type="button"
              onClick={() => void requestNewTomorrowSuggestion()}
              className="flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-orange-800 self-start py-1"
            >
              <RefreshCw size={16} className="shrink-0" />
              Neuer Vorschlag
            </button>
            <ul className="flex flex-col gap-2 border-t border-orange-200/60 pt-4">
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
          </>
        )}
        {!tomorrowSuggestion?.recipe && (
          <p className="text-sm text-stone-600">
            Kein Rezept verfügbar – bitte im Admin aktive Rezepte anlegen.
          </p>
        )}
      </div>
    </div>
  )
}

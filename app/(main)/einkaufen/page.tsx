'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import {
  createTodaySuggestion,
  getSuggestionByDate,
  todayStr,
} from '@/lib/store'
import type { DailySuggestion } from '@/lib/types'
import CheckableIngredientList from '@/components/CheckableIngredientList'

export default function EinkaufenPage() {
  const [todaySuggestion, setTodaySuggestion] = useState<DailySuggestion | null>(null)

  async function refreshLists() {
    try {
      await createTodaySuggestion()
      setTodaySuggestion(await getSuggestionByDate(todayStr()))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        await createTodaySuggestion()
        const today = await getSuggestionByDate(todayStr())
        if (!cancelled) {
          setTodaySuggestion(today)
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
            Noch kein Vorschlag für heute – kurz auf „Rett:mich“ gehen, dann hier aktualisieren.
          </p>
        )}
        {todayRecipe && (
          <>
            <p className="text-sm font-medium text-stone-700">{todayRecipe.title}</p>
            <CheckableIngredientList
              listKey={`shopping:${todayStr()}:${todayRecipe.id}`}
              ingredients={todayRecipe.ingredients}
              className="border-t border-stone-100 pt-4"
            />
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

    </div>
  )
}

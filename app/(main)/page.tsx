'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Flame, ChefHat, RefreshCw, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createTodaySuggestion,
  updateSuggestionStatus,
  getAlternativeSuggestion,
  getSimplerSuggestion,
  getRecipe,
} from '@/lib/store'
import type { DailySuggestion, Recipe } from '@/lib/types'

const CHOPPING_LABEL: Record<string, string> = {
  none: 'Kein Schneiden',
  basic: 'Wenig Schneiden',
  lots: 'Viel Schneiden',
}

function ComplexityBadge({ recipe }: { recipe: Recipe }) {
  const items = [
    recipe.usesOven && 'Backofen',
    recipe.usesStove && 'Herd',
    !recipe.usesStove && !recipe.usesOven && 'Kein Herd',
    recipe.requiresMultitasking && 'Multitasking',
    recipe.chopping !== 'none' && CHOPPING_LABEL[recipe.chopping],
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default function TodayPage() {
  const [suggestion, setSuggestion] = useState<DailySuggestion | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = createTodaySuggestion()
    setSuggestion(s)
    setLoading(false)
  }, [])

  function reject(reason?: string) {
    if (!suggestion) return
    updateSuggestionStatus(suggestion.id, 'rejected', reason)
    // pick an alternative
    const alt = getAlternativeSuggestion(suggestion.recipeId)
    if (alt) {
      setSuggestion({ ...suggestion, recipeId: alt.id, recipe: alt, status: 'pending' })
    } else {
      setSuggestion({ ...suggestion, status: 'rejected' })
    }
    setShowRejectDialog(false)
  }

  function requestSimpler() {
    if (!suggestion?.recipe) return
    const simpler = getSimplerSuggestion(suggestion.recipe)
    if (simpler) {
      updateSuggestionStatus(suggestion.id, 'rejected', 'zu_kompliziert')
      setSuggestion({ ...suggestion, recipeId: simpler.id, recipe: simpler, status: 'pending' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const recipe = suggestion?.recipe

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-4">
        <ChefHat size={48} className="text-stone-300" />
        <p className="text-xl font-semibold text-stone-700">Keine Rezepte vorhanden</p>
        <p className="text-stone-500">Bitte füge zuerst Rezepte im Admin-Bereich hinzu.</p>
      </div>
    )
  }

  if (suggestion?.status === 'rejected' && !recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-4">
        <span className="text-5xl">😴</span>
        <p className="text-xl font-semibold text-stone-700">Kein Vorschlag für heute</p>
        <p className="text-stone-500">Morgen gibt es wieder etwas Leckeres!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <p className="text-sm text-stone-500 font-medium uppercase tracking-wide">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-2xl font-bold text-stone-900 mt-1">Dein heutiger Vorschlag</h1>
      </div>

      {/* Recipe card */}
      <div className="px-4 flex-1">
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          {/* Recipe info */}
          <div className="p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 leading-tight">{recipe.title}</h2>
              <p className="text-stone-500 mt-1 text-base leading-relaxed">{recipe.description}</p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-stone-700">
                <Clock size={18} className="text-orange-500" />
                <span className="text-base font-medium">{recipe.timeMinutes} Min.</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <Flame size={18} className="text-orange-500" />
                <span className="text-base font-medium">{recipe.ingredientCount} Zutaten</span>
              </div>
            </div>

            <ComplexityBadge recipe={recipe} />

            {/* Ingredients preview */}
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Was du brauchst:</p>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-600 text-base">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span>
                      {ing.amount} {ing.unit && `${ing.unit} `}{ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 pb-6">
            <Link
              href={`/kochen/${recipe.id}`}
              className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-orange-700 active:scale-95 transition-all"
            >
              <ChefHat size={20} />
              Jetzt kochen
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Rejection buttons */}
      <div className="px-4 py-6 flex flex-col gap-3">
        <button
          onClick={requestSimpler}
          className="flex items-center justify-center gap-2 w-full border border-stone-300 text-stone-700 font-medium text-base py-3.5 rounded-xl hover:bg-stone-50 active:scale-95 transition-all"
        >
          <RefreshCw size={18} />
          Etwas Einfacheres
        </button>
        <button
          onClick={() => setShowRejectDialog(true)}
          className="flex items-center justify-center gap-2 w-full text-stone-400 text-base py-2 hover:text-stone-600 transition-colors"
        >
          <X size={16} />
          Heute nicht
        </button>
      </div>

      {/* Reject dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setShowRejectDialog(false)}>
          <div
            className="bg-white w-full rounded-t-2xl p-6 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-stone-900">Warum nicht?</h3>
            <p className="text-stone-500 text-sm">Deine Antwort hilft mir, bessere Vorschläge zu machen.</p>
            {[
              { reason: 'keine_zutaten', label: '🛒 Zutaten fehlen' },
              { reason: 'zu_muede', label: '😴 Heute zu müde' },
              { reason: 'kein_hunger', label: '🙅 Kein Hunger darauf' },
              { reason: 'schon_gekocht', label: '✅ Das hatte ich kürzlich schon' },
            ].map(({ reason, label }) => (
              <button
                key={reason}
                onClick={() => reject(reason)}
                className="w-full text-left text-base font-medium text-stone-700 border border-stone-200 rounded-xl px-4 py-3.5 hover:bg-stone-50 active:scale-95 transition-all"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => reject()}
              className="w-full text-stone-400 text-sm py-2 hover:text-stone-600 transition-colors"
            >
              Ohne Angabe überspringen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

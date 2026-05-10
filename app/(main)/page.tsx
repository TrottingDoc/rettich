'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Clock,
  Flame,
  ChefHat,
  RefreshCw,
  X,
  ChevronRight,
  ClipboardList,
  ChevronLeft,
} from 'lucide-react'
import { cn, formatIngredientLine } from '@/lib/utils'
import {
  createTodaySuggestion,
  applySomethingElse,
  type ApplySomethingElseOptions,
} from '@/lib/store'
import { POPULAR_CRAVING_CHOICES } from '@/lib/craving-options'
import type { AlternativeSurveyReason, DailySuggestion, Recipe } from '@/lib/types'

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
  const [showAlternativeSurvey, setShowAlternativeSurvey] = useState(false)
  const [alternativeSurveyStep, setAlternativeSurveyStep] = useState<'reasons' | 'cravings'>(
    'reasons',
  )
  const [selectedCravingIds, setSelectedCravingIds] = useState<string[]>([])
  const [alternativeSurveyHint, setAlternativeSurveyHint] = useState<string | null>(null)
  const [showIngredientsModal, setShowIngredientsModal] = useState(false)
  const [shoppingListFeedback, setShoppingListFeedback] = useState<'idle' | 'saved'>('idle')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const s = await createTodaySuggestion()
        if (!cancelled) setSuggestion(s)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function pinShoppingListToPreferences() {
    if (!recipe) return
    const lines = recipe.ingredients.map(formatIngredientLine)
    const text = `${recipe.title}\n\n${lines.map((l) => `• ${l}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* Clipboard kann z. B. ohne Berechtigung fehlschlagen */
    }
    setShoppingListFeedback('saved')
    window.setTimeout(() => {
      setShowIngredientsModal(false)
      setShoppingListFeedback('idle')
    }, 1400)
  }

  function openAlternativeSurvey() {
    setAlternativeSurveyHint(null)
    setAlternativeSurveyStep('reasons')
    setSelectedCravingIds([])
    setShowAlternativeSurvey(true)
  }

  async function confirmSomethingElse(
    reason: AlternativeSurveyReason,
    options?: ApplySomethingElseOptions,
  ) {
    if (!suggestion?.recipe) return
    setAlternativeSurveyHint(null)
    try {
      const next = await applySomethingElse(suggestion, suggestion.recipe, reason, options)
      setShowAlternativeSurvey(false)
      setAlternativeSurveyStep('reasons')
      setSelectedCravingIds([])
      if (next) {
        setSuggestion(next)
      } else {
        setAlternativeSurveyHint(
          'Gerade passt kein anderes Rezept zu deinen Grenzen. Versuche es später oder lockere die Vorlieben.',
        )
      }
    } catch (err) {
      console.error(err)
      setAlternativeSurveyHint('Beim Speichern ist etwas schiefgelaufen. Bitte erneut versuchen.')
    }
  }

  function toggleCravingChoice(id: string) {
    setSelectedCravingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function confirmSpecificCraving() {
    if (!selectedCravingIds.length) return
    void confirmSomethingElse('specific_craving', { cravingChoiceIds: selectedCravingIds })
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-0 py-16">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const recipe = suggestion?.recipe

  if (!recipe) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-0 px-6 py-16 text-center gap-4">
        <ChefHat size={48} className="text-stone-300" />
        <p className="text-xl font-semibold text-stone-700">Keine Rezepte vorhanden</p>
        <p className="text-stone-500">Bitte füge zuerst Rezepte im Admin-Bereich hinzu.</p>
      </div>
    )
  }

  if (suggestion?.status === 'rejected' && !recipe) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-0 px-6 py-16 text-center gap-4">
        <span className="text-5xl">😴</span>
        <p className="text-xl font-semibold text-stone-700">Kein Vorschlag für heute</p>
        <p className="text-stone-500">Morgen gibt es wieder etwas Leckeres!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <p className="text-sm text-stone-500 font-medium uppercase tracking-wide">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-2xl font-bold text-stone-900 mt-1">Dein heutiger Vorschlag</h1>
      </div>

      {/* Recipe card + actions */}
      <div className="px-4 flex flex-col gap-3 flex-1 pb-6">
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

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200/80">
              <Image
                src={recipe.imageUrl?.trim() ? recipe.imageUrl.trim() : '/image_rettich.png'}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(max-width: 448px) 100vw, 400px"
                priority
              />
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 pb-6 flex flex-col">
            <Link
              href={`/kochen/${recipe.id}`}
              className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-orange-700 active:scale-95 transition-all"
            >
              <ChefHat size={20} />
              Jetzt kochen
              <ChevronRight size={20} />
            </Link>
            <button
              type="button"
              onClick={() => setShowIngredientsModal(true)}
              className="mt-3 text-sm font-medium text-orange-700 hover:text-orange-800 text-center py-1 underline underline-offset-2 decoration-orange-700/50 hover:decoration-orange-800"
            >
              Zeig mir die benötigten Lebensmittel
            </button>
          </div>
        </div>

        {/* Rejection buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={openAlternativeSurvey}
            className="flex items-center justify-center gap-2 w-full border border-stone-300 text-stone-700 font-medium text-base py-3.5 rounded-xl hover:bg-stone-50 active:scale-95 transition-all"
          >
            <RefreshCw size={18} />
            Etwas anderes
          </button>
          {alternativeSurveyHint && (
            <p className="text-sm text-amber-800 text-center px-1">{alternativeSurveyHint}</p>
          )}
        </div>
      </div>

      {/* Einkaufsliste Pop-up */}
      {showIngredientsModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => {
            setShowIngredientsModal(false)
            setShoppingListFeedback('idle')
          }}
        >
          <div
            className="bg-white w-full max-w-md sm:rounded-2xl rounded-t-2xl p-6 flex flex-col gap-4 max-h-[min(88dvh,32rem)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-stone-900 leading-snug">Benötigte Lebensmittel</h3>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">{recipe.title}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowIngredientsModal(false)
                  setShoppingListFeedback('idle')
                }}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 shrink-0"
                aria-label="Schließen"
              >
                <X size={22} />
              </button>
            </div>
            <ul className="overflow-y-auto flex-1 min-h-0 space-y-2.5 border border-stone-200 rounded-xl px-4 py-3 bg-stone-50/80">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-3 text-stone-800 text-base leading-snug">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  <span>{formatIngredientLine(ing)}</span>
                </li>
              ))}
            </ul>
            {shoppingListFeedback === 'saved' && (
              <p className="text-sm text-green-700 font-medium">
                Liste in die Zwischenablage kopiert – unter „Einkaufen“ siehst du sie auch.
              </p>
            )}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => void pinShoppingListToPreferences()}
                disabled={shoppingListFeedback === 'saved'}
                className={cn(
                  'flex items-center justify-center gap-2 w-full font-semibold text-base py-3.5 rounded-xl transition-all',
                  shoppingListFeedback === 'saved'
                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98]',
                )}
              >
                <ClipboardList size={20} />
                Auf meine Einkaufsliste setzen
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIngredientsModal(false)
                  setShoppingListFeedback('idle')
                }}
                className="w-full text-stone-600 font-medium text-base py-3 rounded-xl border border-stone-200 hover:bg-stone-50 active:scale-[0.98] transition-all"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Umfrage „Etwas anderes“ */}
      {showAlternativeSurvey && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => {
            setShowAlternativeSurvey(false)
            setAlternativeSurveyStep('reasons')
            setSelectedCravingIds([])
          }}
        >
          <div
            className="bg-white w-full max-w-md sm:rounded-2xl rounded-t-2xl p-6 flex flex-col gap-3 shadow-xl max-h-[min(88dvh,36rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {alternativeSurveyStep === 'reasons' ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">Warum etwas anderes?</h3>
                    <p className="text-stone-500 text-sm mt-1">
                      Deine Antwort passt die nächsten Vorschläge an (Zeit, Zutaten, Geschirr).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAlternativeSurvey(false)
                      setAlternativeSurveyStep('reasons')
                      setSelectedCravingIds([])
                    }}
                    className="p-2 rounded-full hover:bg-stone-100 text-stone-500 shrink-0"
                    aria-label="Schließen"
                  >
                    <X size={22} />
                  </button>
                </div>
                {(
                  [
                    { reason: 'faster' as const, label: 'Soll schneller gehen' },
                    { reason: 'fewer_ingredients' as const, label: 'Weniger Lebensmittel verwenden' },
                    { reason: 'fewer_utensils' as const, label: 'Weniger Utensilien verwenden' },
                    { reason: 'specific_craving' as const, label: 'Habe Lust auf was Bestimmtes' },
                    { reason: 'dislike' as const, label: 'Mag ich nicht' },
                    { reason: 'no_mood' as const, label: 'Heute keine Lust drauf' },
                    { reason: 'prefer_not_say' as const, label: 'Sag ich nicht' },
                  ] satisfies { reason: AlternativeSurveyReason; label: string }[]
                ).map(({ reason, label }) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() =>
                      reason === 'specific_craving'
                        ? setAlternativeSurveyStep('cravings')
                        : void confirmSomethingElse(reason)
                    }
                    className="w-full text-left text-base font-medium text-stone-700 border border-stone-200 rounded-xl px-4 py-3.5 hover:bg-stone-50 active:scale-[0.98] transition-all"
                  >
                    {label}
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setAlternativeSurveyStep('reasons')}
                    className="flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-800 -ml-1 py-1"
                  >
                    <ChevronLeft size={18} />
                    Zurück
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAlternativeSurvey(false)
                      setAlternativeSurveyStep('reasons')
                      setSelectedCravingIds([])
                    }}
                    className="p-2 rounded-full hover:bg-stone-100 text-stone-500 shrink-0"
                    aria-label="Schließen"
                  >
                    <X size={22} />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">Worauf hast du Lust?</h3>
                  <p className="text-stone-500 text-sm mt-1">
                    Wähle eine oder mehrere Zutaten – wir schlagen ein passendes Rezept vor.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CRAVING_CHOICES.map((c) => {
                    const on = selectedCravingIds.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCravingChoice(c.id)}
                        className={cn(
                          'text-sm font-medium rounded-full px-3.5 py-2 border transition-all',
                          on
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100',
                        )}
                      >
                        {c.label}
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  disabled={selectedCravingIds.length === 0}
                  onClick={confirmSpecificCraving}
                  className={cn(
                    'w-full font-semibold text-base py-3.5 rounded-xl transition-all',
                    selectedCravingIds.length === 0
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98]',
                  )}
                >
                  Passendes Rezept vorschlagen
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

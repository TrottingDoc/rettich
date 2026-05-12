'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  Flame,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import { cn, formatIngredientLine } from '@/lib/utils'
import {
  applySomethingElse,
  createTodaySuggestion,
  createTodaySuggestionForCraving,
  getRecipeCollection,
  type ApplySomethingElseOptions,
  type RecipeCollectionItem,
} from '@/lib/store'
import { POPULAR_CRAVING_CHOICES } from '@/lib/craving-options'
import type { AlternativeSurveyReason, DailySuggestion, Recipe } from '@/lib/types'

const CHOPPING_LABEL: Record<string, string> = {
  none: 'Kein Schneiden',
  basic: 'Wenig Schneiden',
  lots: 'Viel Schneiden',
}

type ViewMode = 'menu' | 'suggestion' | 'cravings' | 'collection'

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

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-800 py-1"
    >
      <ChevronLeft size={18} />
      Zurück
    </button>
  )
}

export default function TodayPage() {
  const [mode, setMode] = useState<ViewMode>('menu')
  const [suggestion, setSuggestion] = useState<DailySuggestion | null>(null)
  const [collection, setCollection] = useState<RecipeCollectionItem[]>([])
  const [selectedCravingIds, setSelectedCravingIds] = useState<string[]>([])
  const [showAlternativeSurvey, setShowAlternativeSurvey] = useState(false)
  const [alternativeSurveyStep, setAlternativeSurveyStep] = useState<'reasons' | 'cravings'>(
    'reasons',
  )
  const [alternativeSurveyHint, setAlternativeSurveyHint] = useState<string | null>(null)
  const [showIngredientsModal, setShowIngredientsModal] = useState(false)
  const [shoppingListFeedback, setShoppingListFeedback] = useState<'idle' | 'saved'>('idle')
  const [loading, setLoading] = useState(false)

  const recipe = suggestion?.recipe

  async function suggestRecipe() {
    setLoading(true)
    setAlternativeSurveyHint(null)
    try {
      const next = await createTodaySuggestion()
      setSuggestion(next)
      setMode('suggestion')
    } catch (err) {
      console.error(err)
      setAlternativeSurveyHint('Beim Vorschlagen ist etwas schiefgelaufen. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  async function suggestForCraving() {
    if (!selectedCravingIds.length) return
    setLoading(true)
    setAlternativeSurveyHint(null)
    try {
      const next = await createTodaySuggestionForCraving(selectedCravingIds)
      setSuggestion(next)
      setSelectedCravingIds([])
      setMode('suggestion')
      if (!next) {
        setAlternativeSurveyHint('Dazu finde ich gerade kein passendes Rezept.')
      }
    } catch (err) {
      console.error(err)
      setAlternativeSurveyHint('Beim Vorschlagen ist etwas schiefgelaufen. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  async function openCollection() {
    setLoading(true)
    setAlternativeSurveyHint(null)
    try {
      setCollection(await getRecipeCollection())
      setMode('collection')
    } catch (err) {
      console.error(err)
      setAlternativeSurveyHint('Die Rezeptsammlung konnte nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

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

  function resetToMenu() {
    setMode('menu')
    setAlternativeSurveyHint(null)
    setSelectedCravingIds([])
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-8 pb-4">
        <p className="text-sm text-stone-500 font-medium uppercase tracking-wide">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-2xl font-bold text-stone-900 mt-1">Heute</h1>
      </div>

      <div className="px-4 flex flex-col gap-4 flex-1 pb-6">
        {mode === 'menu' && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => void suggestRecipe()}
              disabled={loading}
              className="bg-white rounded-2xl border border-stone-200 p-5 text-left shadow-sm hover:border-orange-300 active:scale-[0.99] transition-all disabled:opacity-60"
            >
              <span className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Sparkles size={22} />
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold text-stone-900">
                    Mach mir einen Rezeptvorschlag
                  </span>
                  <span className="block text-sm text-stone-500 mt-0.5">
                    Schlag mir ein zufällig ausgewähltes Rezept vor, das zu meinen angewählten Vorlieben passt.
                  </span>
                </span>
                <ChevronRight size={20} className="text-stone-300" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCravingIds([])
                setMode('cravings')
              }}
              className="bg-white rounded-2xl border border-stone-200 p-5 text-left shadow-sm hover:border-orange-300 active:scale-[0.99] transition-all"
            >
              <span className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <Flame size={22} />
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold text-stone-900">
                    Heute habe ich Lust auf…
                  </span>
                  <span className="block text-sm text-stone-500 mt-0.5">
                    …eine bestimmte Zutat oder Art von Gericht.
                  </span>
                </span>
                <ChevronRight size={20} className="text-stone-300" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => void openCollection()}
              disabled={loading}
              className="bg-white rounded-2xl border border-stone-200 p-5 text-left shadow-sm hover:border-orange-300 active:scale-[0.99] transition-all disabled:opacity-60"
            >
              <span className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center">
                  <BookOpen size={22} />
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold text-stone-900">
                    Meine Rezeptsammlung anzeigen
                  </span>
                  <span className="block text-sm text-stone-500 mt-0.5">
                    Alle Rezepte, die in Rett:ich gespeichert sind.
                  </span>
                </span>
                <ChevronRight size={20} className="text-stone-300" />
              </span>
            </button>

            {alternativeSurveyHint && (
              <p className="text-sm text-amber-800 text-center px-1">{alternativeSurveyHint}</p>
            )}
          </div>
        )}

        {mode === 'cravings' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
            <BackButton onClick={resetToMenu} />
            <div>
              <h2 className="text-xl font-bold text-stone-900">Worauf hast du Lust?</h2>
              <p className="text-stone-500 text-sm mt-1">
                Das sind dieselben Auswahloptionen wie bisher bei „Habe Lust auf was Bestimmtes“.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_CRAVING_CHOICES.map((choice) => {
                const on = selectedCravingIds.includes(choice.id)
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => toggleCravingChoice(choice.id)}
                    className={cn(
                      'text-sm font-medium rounded-full px-3.5 py-2 border transition-all',
                      on
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100',
                    )}
                  >
                    {choice.label}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              disabled={loading || selectedCravingIds.length === 0}
              onClick={() => void suggestForCraving()}
              className={cn(
                'w-full font-semibold text-base py-3.5 rounded-xl transition-all',
                loading || selectedCravingIds.length === 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98]',
              )}
            >
              {loading ? 'Suche Rezept…' : 'Passendes Rezept vorschlagen'}
            </button>
            {alternativeSurveyHint && (
              <p className="text-sm text-amber-800 text-center px-1">{alternativeSurveyHint}</p>
            )}
          </div>
        )}

        {mode === 'suggestion' && (
          <>
            <BackButton onClick={resetToMenu} />
            {!recipe ? (
              <div className="flex flex-1 flex-col items-center justify-center min-h-0 px-6 py-16 text-center gap-4">
                <ChefHat size={48} className="text-stone-300" />
                <p className="text-xl font-semibold text-stone-700">Keine Rezepte vorhanden</p>
                <p className="text-stone-500">Bitte füge zuerst Rezepte im Admin-Bereich hinzu.</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                  <div className="p-6 flex flex-col gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900 leading-tight">{recipe.title}</h2>
                      <p className="text-stone-500 mt-1 text-base leading-relaxed">{recipe.description}</p>
                    </div>

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
              </>
            )}
          </>
        )}

        {mode === 'collection' && (
          <div className="flex flex-col gap-3">
            <BackButton onClick={resetToMenu} />
            <div>
              <h2 className="text-xl font-bold text-stone-900">Meine Rezeptsammlung</h2>
              <p className="text-stone-500 text-sm mt-1">
                Alle aktiven Rezepte mit deinen bisherigen Markern.
              </p>
            </div>
            {collection.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col gap-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-stone-900 text-base leading-snug">{item.title}</h3>
                    <p className="text-sm text-stone-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-stone-500 shrink-0">
                    <Clock size={13} />
                    {item.timeMinutes} Min.
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.cookedBefore && (
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                      <ThumbsUp size={12} />
                      Schon gekocht
                    </span>
                  )}
                  {item.rejectedBefore && (
                    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                      <ThumbsDown size={12} />
                      Nicht wieder kochen
                    </span>
                  )}
                  {!item.cookedBefore && !item.rejectedBefore && (
                    <span className="text-xs text-stone-500 bg-stone-100 rounded-full px-2.5 py-1">
                      Noch offen
                    </span>
                  )}
                </div>
                <Link
                  href={`/kochen/${item.id}`}
                  className="text-sm text-orange-600 font-medium hover:text-orange-700 transition-colors"
                >
                  Rezept kochen →
                </Link>
              </div>
            ))}
            {collection.length === 0 && (
              <p className="text-stone-500 text-center py-8">Noch keine aktiven Rezepte vorhanden.</p>
            )}
          </div>
        )}
      </div>

      {showIngredientsModal && recipe && (
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
                      Deine Antwort passt die nächsten Vorschläge an.
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
                <BackButton onClick={() => setAlternativeSurveyStep('reasons')} />
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">Worauf hast du Lust?</h3>
                  <p className="text-stone-500 text-sm mt-1">
                    Wähle eine oder mehrere Zutaten.
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
                  onClick={() => void confirmSomethingElse('specific_craving', { cravingChoiceIds: selectedCravingIds })}
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

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  Flame,
  LifeBuoy,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react'
import { cn, formatIngredientLine } from '@/lib/utils'
import CheckableIngredientList, { getIngredientItemKey } from '@/components/CheckableIngredientList'
import RecipeImage from '@/components/RecipeImage'
import { RESET_HOME_EVENT } from '@/components/RettMichNavLink'
import {
  applySomethingElse,
  createTodaySuggestion,
  getRecipesForCraving,
  todayStr,
  type ApplySomethingElseOptions,
  type CravingRecipeMatch,
} from '@/lib/store'
import { POPULAR_CRAVING_CHOICES } from '@/lib/craving-options'
import type { AlternativeSurveyReason, DailySuggestion, Recipe } from '@/lib/types'

const CHOPPING_LABEL: Record<string, string> = {
  none: 'Kein Schneiden',
  basic: 'Wenig Schneiden',
  lots: 'Viel Schneiden',
}

type ViewMode = 'menu' | 'suggestion' | 'cravings'

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
  const [cravingMatches, setCravingMatches] = useState<CravingRecipeMatch[]>([])
  const [selectedCravingIds, setSelectedCravingIds] = useState<string[]>([])
  const [showAlternativeSurvey, setShowAlternativeSurvey] = useState(false)
  const [alternativeSurveyStep, setAlternativeSurveyStep] = useState<'reasons' | 'cravings'>(
    'reasons',
  )
  const [alternativeSurveyHint, setAlternativeSurveyHint] = useState<string | null>(null)
  const [showIngredientsModal, setShowIngredientsModal] = useState(false)
  const [shoppingListFeedback, setShoppingListFeedback] = useState<'idle' | 'saved'>('idle')
  const [checkedIngredientKeys, setCheckedIngredientKeys] = useState<string[]>([])
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

  async function showRecipesForCraving() {
    if (!selectedCravingIds.length) return
    setLoading(true)
    setAlternativeSurveyHint(null)
    try {
      const matches = await getRecipesForCraving(selectedCravingIds)
      setCravingMatches(matches)
      if (!matches.length) {
        setAlternativeSurveyHint('Dazu finde ich gerade kein passendes Rezept.')
      }
    } catch (err) {
      console.error(err)
      setAlternativeSurveyHint('Beim Vorschlagen ist etwas schiefgelaufen. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  async function pinShoppingListToPreferences() {
    if (!recipe) return
    const checked = new Set(checkedIngredientKeys)
    const lines = recipe.ingredients
      .filter((ingredient, index) => !checked.has(getIngredientItemKey(ingredient, index)))
      .map(formatIngredientLine)
    const text = `${recipe.title}\n\n${
      lines.length ? lines.map((l) => `• ${l}`).join('\n') : 'Nichts einzukaufen.'
    }`
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
    setCravingMatches([])
    setAlternativeSurveyHint(null)
    setSelectedCravingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const resetToMenu = useCallback(() => {
    setMode('menu')
    setAlternativeSurveyHint(null)
    setSelectedCravingIds([])
    setCravingMatches([])
  }, [])

  useEffect(() => {
    window.addEventListener(RESET_HOME_EVENT, resetToMenu)
    return () => window.removeEventListener(RESET_HOME_EVENT, resetToMenu)
  }, [resetToMenu])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-8 pb-4">
        <p className="text-sm text-stone-500 font-medium uppercase tracking-wide">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-900 mt-1">
          <LifeBuoy size={26} className="text-orange-600 shrink-0" />
          Rett:mich
        </h1>
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
                setCravingMatches([])
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
                Wähle eine oder mehrere Zutaten oder Kategorien aus, die dir heute schmecken würden.
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
              onClick={() => void showRecipesForCraving()}
              className={cn(
                'w-full font-semibold text-base py-3.5 rounded-xl transition-all',
                loading || selectedCravingIds.length === 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98]',
              )}
            >
              {loading ? 'Suche Rezepte…' : 'Passende Rezepte anzeigen'}
            </button>
            {alternativeSurveyHint && (
              <p className="text-sm text-amber-800 text-center px-1">{alternativeSurveyHint}</p>
            )}
            {cravingMatches.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-stone-100 pt-4">
                <p className="text-sm font-semibold text-stone-700">
                  {cravingMatches.length} passende Rezepte
                </p>
                {cravingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-stone-900 text-base leading-snug">
                          {match.title}
                        </h3>
                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                          {match.description}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-stone-500 shrink-0">
                        <Clock size={13} />
                        {match.timeMinutes} Min.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {match.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-stone-600 bg-white border border-stone-200 rounded-full px-2.5 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/kochen/${match.id}`}
                      className="flex items-center gap-1 text-sm text-orange-600 font-medium hover:text-orange-700 transition-colors"
                    >
                      <ChefHat size={14} />
                      Rezept kochen
                    </Link>
                  </div>
                ))}
              </div>
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
                      <RecipeImage key={recipe.id} recipe={recipe} priority />
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
                      onClick={() => {
                        setCheckedIngredientKeys([])
                        setShowIngredientsModal(true)
                      }}
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
            <CheckableIngredientList
              listKey={`shopping:${todayStr()}:${recipe.id}`}
              ingredients={recipe.ingredients}
              className="overflow-y-auto flex-1 min-h-0 space-y-2.5 border border-stone-200 rounded-xl px-4 py-3 bg-stone-50/80"
              onCheckedChange={setCheckedIngredientKeys}
            />
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
                  'flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all text-left',
                  shoppingListFeedback === 'saved'
                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98]',
                )}
              >
                <ClipboardList size={17} className="shrink-0" />
                <span className="flex flex-col leading-snug">
                  <span className="text-base font-semibold">Diese Liste kopieren</span>
                  <span className="text-xs font-medium text-white/85">
                    Wähle vorhandene Zutaten vorher in der Liste ab.
                  </span>
                </span>
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

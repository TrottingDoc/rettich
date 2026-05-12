'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Timer, CheckCircle, PauseCircle, ArrowRight, ChefHat, Minus, Plus, Clock, Flame } from 'lucide-react'
import {
  getRecipe,
  saveFeedback,
  setTodayRecipeForShoppingList,
  updateSuggestionStatus,
  getTodaySuggestion,
} from '@/lib/store'
import type { Fix, Ingredient, Recipe, Step, Substitution } from '@/lib/types'
import { cn, formatIngredientLine } from '@/lib/utils'
import RecipeImage from '@/components/RecipeImage'

function truncateTimerLabel(text: string, maxLen = 140): string {
  const t = text.trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, maxLen - 1)}…`
}

type CookTimerState = {
  remaining: number
  running: boolean
  initialSeconds: number
  /** Schritt-Text des Rezepts, für den diese Zeit gedacht ist */
  label: string
}

const INGREDIENT_STOP_WORDS = new Set([
  'oder',
  'und',
  'mit',
  'ohne',
  'nach',
  'geschmack',
  'optional',
  'frisch',
  'frische',
  'frischer',
  'gerieben',
  'geriebener',
  'gehackt',
  'gewuerfelt',
  'dose',
  'packung',
  'stueck',
])

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function getIngredientTokens(name: string): string[] {
  return normalizeSearchText(name)
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !INGREDIENT_STOP_WORDS.has(token))
}

function getTextTokens(value: string): string[] {
  return normalizeSearchText(value)
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !INGREDIENT_STOP_WORDS.has(token))
}

function getStepIngredients(recipe: Recipe, step: Step): Ingredient[] {
  if (step.ingredients?.length) return step.ingredients

  const normalizedStep = normalizeSearchText(step.text)
  if (!normalizedStep) return []

  return recipe.ingredients.filter((ingredient) =>
    getIngredientTokens(ingredient.name).some((token) => normalizedStep.includes(token)),
  )
}

function ingredientNamesOverlap(a: string, b: string): boolean {
  const aTokens = getIngredientTokens(a)
  const bTokens = getIngredientTokens(b)
  return aTokens.some((aToken) =>
    bTokens.some((bToken) => aToken.includes(bToken) || bToken.includes(aToken)),
  )
}

function getCurrentStepContext(step: Step, stepIngredients: Ingredient[]): string {
  return normalizeSearchText(
    [step.text, step.checkText, ...stepIngredients.map((ingredient) => ingredient.name)].join(' '),
  )
}

function getStepSubstitutions(
  substitutions: Substitution[],
  step: Step,
  stepIngredients: Ingredient[],
): Substitution[] {
  const context = getCurrentStepContext(step, stepIngredients)

  return substitutions.filter((substitution) => {
    const substitutionTokens = getIngredientTokens(substitution.ingredient)
    const ingredientHit = stepIngredients.some((ingredient) =>
      ingredientNamesOverlap(substitution.ingredient, ingredient.name),
    )
    const contextHit = substitutionTokens.some((token) => context.includes(token))
    return ingredientHit || contextHit
  })
}

function getStepFixes(fixes: Fix[], step: Step, stepIngredients: Ingredient[]): Fix[] {
  const context = getCurrentStepContext(step, stepIngredients)
  if (!context) return []

  return fixes.filter((fix) => {
    const tokens = getTextTokens(`${fix.problem} ${fix.solution}`)
    return tokens.some((token) => context.includes(token))
  })
}

function getStepTimer(
  recipe: Recipe,
  stepIndex: number,
  prev: CookTimerState | null,
): CookTimerState | null {
  const currentStep = recipe.steps[stepIndex]
  const dur =
    currentStep.durationSeconds != null && currentStep.durationSeconds > 0
      ? currentStep.durationSeconds
      : null

  if (prev?.running && prev.remaining > 0) return prev
  if (prev && prev.remaining > 0 && prev.remaining < prev.initialSeconds) return prev
  if (dur) {
    const idleAtFull =
      !!prev && !prev.running && prev.remaining === prev.initialSeconds && prev.remaining > 0
    const completed = !!prev && prev.remaining === 0 && !prev.running
    const noPrev = !prev
    if (noPrev || completed || idleAtFull) {
      return {
        remaining: dur,
        initialSeconds: dur,
        running: false,
        label: truncateTimerLabel(currentStep.text),
      }
    }
  }
  if (prev && prev.remaining > 0) return prev
  if (prev && prev.remaining === 0) return prev
  return null
}

function TimerBar({
  remaining,
  running,
  initialSeconds,
  label,
  onToggleRunning,
  onAdjustTime,
}: {
  remaining: number
  running: boolean
  initialSeconds: number
  label: string
  onToggleRunning: () => void
  onAdjustTime: (deltaSeconds: number) => void
}) {
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="flex flex-col gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
      <div className="flex items-start gap-3">
        <Timer size={20} className="text-orange-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-800/85">Timer für</p>
          <p className="text-sm text-orange-950 leading-snug mt-0.5 line-clamp-3">{label}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-orange-200/80 pt-3">
        <button
          type="button"
          onClick={() => onAdjustTime(-60)}
          disabled={remaining <= 0}
          aria-label="Timer um eine Minute verkürzen"
          className="p-2 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus size={16} />
        </button>
        <span className="min-w-16 text-center text-lg font-bold text-orange-700 tabular-nums">
          {mins}:{String(secs).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={() => onAdjustTime(60)}
          aria-label="Timer um eine Minute verlängern"
          className="p-2 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-100 transition-colors"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={onToggleRunning}
          className="ml-auto text-sm font-semibold text-orange-700 border border-orange-300 rounded-lg px-3 py-1 hover:bg-orange-100 transition-colors"
        >
          {running ? 'Pause' : remaining === initialSeconds ? 'Starten' : 'Weiter'}
        </button>
      </div>
    </div>
  )
}

function FeedbackDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (wouldCookAgain: boolean, tooHard: boolean, tooLong: boolean) => void
}) {
  const [wouldCookAgain, setWouldCookAgain] = useState<boolean | null>(null)
  const [tooHard, setTooHard] = useState(false)
  const [tooLong, setTooLong] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-6 flex flex-col gap-5">
        <div>
          <h3 className="text-xl font-bold text-stone-900">Wie war es?</h3>
          <p className="text-stone-500 text-sm mt-1">Nur 2 Taps – das war&apos;s.</p>
        </div>

        <div>
          <p className="text-base font-semibold text-stone-700 mb-3">Würdest du es wieder kochen?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setWouldCookAgain(true)}
              className={cn(
                'flex-1 py-4 rounded-xl text-2xl border-2 transition-all',
                wouldCookAgain === true
                  ? 'border-green-500 bg-green-50'
                  : 'border-stone-200 hover:border-stone-300',
              )}
            >
              👍 Ja
            </button>
            <button
              onClick={() => setWouldCookAgain(false)}
              className={cn(
                'flex-1 py-4 rounded-xl text-2xl border-2 transition-all',
                wouldCookAgain === false
                  ? 'border-red-400 bg-red-50'
                  : 'border-stone-200 hover:border-stone-300',
              )}
            >
              👎 Nein
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-stone-500">Optional:</p>
          <button
            onClick={() => setTooHard((v) => !v)}
            className={cn(
              'text-left text-base border rounded-xl px-4 py-3 transition-all',
              tooHard ? 'border-red-400 bg-red-50 text-red-700' : 'border-stone-200 text-stone-600',
            )}
          >
            😓 War etwas zu schwierig
          </button>
          <button
            onClick={() => setTooLong((v) => !v)}
            className={cn(
              'text-left text-base border rounded-xl px-4 py-3 transition-all',
              tooLong ? 'border-red-400 bg-red-50 text-red-700' : 'border-stone-200 text-stone-600',
            )}
          >
            ⏱️ Hat länger gedauert als gedacht
          </button>
        </div>

        <button
          disabled={wouldCookAgain === null}
          onClick={() => onSubmit(wouldCookAgain!, tooHard, tooLong)}
          className="w-full bg-orange-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          Fertig!
        </button>

        <button onClick={onClose} className="text-stone-400 text-sm text-center hover:text-stone-600 transition-colors">
          Überspringen
        </button>
      </div>
    </div>
  )
}

export default function KochenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const { id } = use(params)
  const { preview } = use(searchParams)
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showOverview, setShowOverview] = useState(preview === '1')
  const [cookTimer, setCookTimer] = useState<CookTimerState | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const r = await getRecipe(id)
        if (!cancelled && r) {
          setRecipe(r)
          setCookTimer(getStepTimer(r, 0, null))
          void setTodayRecipeForShoppingList(r.id).catch((err) => console.error(err))
        }
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!cookTimer?.running || cookTimer.remaining <= 0) return
    const t = setTimeout(() => {
      setCookTimer((c) => {
        if (!c?.running) return c
        const next = c.remaining - 1
        if (next <= 0) {
          return { ...c, remaining: 0, running: false }
        }
        return { ...c, remaining: next }
      })
    }, 1000)
    return () => clearTimeout(t)
  }, [cookTimer?.running, cookTimer?.remaining])

  const toggleCookTimer = useCallback(() => {
    setCookTimer((c) => (c ? { ...c, running: !c.running } : c))
  }, [])

  const adjustCookTimer = useCallback((deltaSeconds: number) => {
    setCookTimer((c) => {
      if (!c) return c
      const remaining = Math.max(0, c.remaining + deltaSeconds)
      return {
        ...c,
        remaining,
        initialSeconds: Math.max(remaining, c.initialSeconds + deltaSeconds),
        running: remaining > 0 ? c.running : false,
      }
    })
  }, [])

  const goToStep = useCallback(
    (nextIndex: number) => {
      if (!recipe) return
      setStepIndex(nextIndex)
      setCookTimer((prev) => getStepTimer(recipe, nextIndex, prev))
    },
    [recipe],
  )

  async function submitFeedback(wouldCookAgain: boolean, tooHard: boolean, tooLong: boolean) {
    try {
      const suggestion = await getTodaySuggestion()
      if (suggestion) {
        await saveFeedback({
          suggestionId: suggestion.id,
          recipeId: id,
          wouldCookAgain,
          tooHard,
          tooLong,
        })
        await updateSuggestionStatus(suggestion.id, 'completed')
      }
    } catch (err) {
      console.error(err)
    }
    router.push('/')
  }

  if (!recipe) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-0 py-16">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalSteps = recipe.steps.length
  const step: Step = recipe.steps[stepIndex]
  const stepIngredients = getStepIngredients(recipe, step)
  const stepSubstitutions = getStepSubstitutions(recipe.substitutions, step, stepIngredients)
  const stepFixes = getStepFixes(recipe.fixes, step, stepIngredients)
  const progress = ((stepIndex + 1) / totalSteps) * 100

  if (showOverview) {
    return (
      <div className="px-4 pt-6 pb-6 flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-800 py-1"
        >
          <ArrowLeft size={18} />
          Zurück
        </button>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs text-stone-400 font-medium uppercase tracking-wide mb-1">
                Rezeptübersicht
              </p>
              <h1 className="text-2xl font-bold text-stone-900 leading-tight">{recipe.title}</h1>
              <p className="text-stone-500 mt-1 text-base leading-relaxed">{recipe.description}</p>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200/80">
              <RecipeImage key={recipe.id} recipe={recipe} priority />
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

            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                Zutaten
              </p>
              <ul className="space-y-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-700 leading-snug">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span>{formatIngredientLine(ing)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={() => setShowOverview(false)}
              className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-orange-700 active:scale-95 transition-all"
            >
              <ChefHat size={20} />
              Mit Schritt 1 starten
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-0 px-6 py-12 text-center gap-6">
        <div className="text-7xl">🎉</div>
        <h2 className="text-3xl font-bold text-stone-900">Fertig!</h2>
        <p className="text-stone-500 text-lg">Guten Appetit!</p>
        <button
          onClick={() => setShowFeedback(true)}
          className="w-full max-w-xs bg-orange-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-orange-700 active:scale-95 transition-all"
        >
          Bewerten
        </button>
        <button
          onClick={() => router.push('/')}
          className="text-stone-400 text-sm hover:text-stone-600 transition-colors"
        >
          Zur Startseite
        </button>
        {showFeedback && (
          <FeedbackDialog
            onClose={() => router.push('/')}
            onSubmit={submitFeedback}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft size={22} className="text-stone-600" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Kochmodus</p>
          <h1 className="text-base font-bold text-stone-900 truncate">{recipe.title}</h1>
        </div>
        <span className="text-sm text-stone-400">
          {stepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-stone-100 mx-4 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 py-6 flex flex-col gap-4">
        {step.isStopPoint && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <PauseCircle size={18} className="text-blue-600 shrink-0" />
            <span className="text-sm font-medium text-blue-700">Guter Moment zum Pausieren</span>
          </div>
        )}

        <div className="flex-1 bg-white rounded-2xl border border-stone-200 p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-bold text-base flex items-center justify-center">
              {stepIndex + 1}
            </span>
            <p className="text-xl leading-relaxed text-stone-800 font-medium pt-1">{step.text}</p>
          </div>

          {!!stepIngredients.length && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                Zutaten für diesen Schritt
              </p>
              <ul className="space-y-1.5">
                {stepIngredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-700 leading-snug">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span>{formatIngredientLine(ing)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cookTimer && (
            <TimerBar
              remaining={cookTimer.remaining}
              running={cookTimer.running}
              initialSeconds={cookTimer.initialSeconds}
              label={cookTimer.label}
              onToggleRunning={toggleCookTimer}
              onAdjustTime={adjustCookTimer}
            />
          )}

          {step.checkText && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{step.checkText}</p>
            </div>
          )}
        </div>

        {stepSubstitutions.length > 0 && (
          <details className="bg-stone-50 border border-stone-200 rounded-xl">
            <summary className="px-4 py-3 text-sm font-medium text-stone-600 cursor-pointer list-none flex items-center gap-2">
              <ChefHat size={16} className="text-stone-400" />
              Zutat ersetzen?
            </summary>
            <div className="px-4 pb-4 space-y-2">
              {stepSubstitutions.map((s, i) => (
                <p key={i} className="text-sm text-stone-600">
                  <span className="font-medium">{s.ingredient}</span> → {s.substitute}
                </p>
              ))}
            </div>
          </details>
        )}

        {stepFixes.length > 0 && (
          <details className="bg-stone-50 border border-stone-200 rounded-xl">
            <summary className="px-4 py-3 text-sm font-medium text-stone-600 cursor-pointer list-none flex items-center gap-2">
              🆘 Etwas läuft schief?
            </summary>
            <div className="px-4 pb-4 space-y-2">
              {stepFixes.map((f, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-stone-700">{f.problem}</p>
                  <p className="text-sm text-stone-500">{f.solution}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6 flex gap-3">
        {stepIndex > 0 && (
          <button
            onClick={() => goToStep(stepIndex - 1)}
            className="flex-1 border border-stone-300 text-stone-700 font-semibold py-4 rounded-xl hover:bg-stone-50 active:scale-95 transition-all"
          >
            Zurück
          </button>
        )}
        <button
          onClick={() => {
            if (stepIndex < totalSteps - 1) {
              goToStep(stepIndex + 1)
            } else {
              setCookTimer(null)
              setDone(true)
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-orange-700 active:scale-95 transition-all"
        >
          {stepIndex < totalSteps - 1 ? (
            <>Weiter <ArrowRight size={20} /></>
          ) : (
            <>Fertig! 🎉</>
          )}
        </button>
      </div>
    </div>
  )
}

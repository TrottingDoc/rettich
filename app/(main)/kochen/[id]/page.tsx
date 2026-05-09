'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Timer, CheckCircle, PauseCircle, ArrowRight, ChefHat } from 'lucide-react'
import { getRecipe, saveFeedback, updateSuggestionStatus, getTodaySuggestion } from '@/lib/store'
import type { Recipe, Step } from '@/lib/types'
import { cn } from '@/lib/utils'

function TimerDisplay({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) { onDone(); return }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [running, remaining, onDone])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
      <Timer size={20} className="text-orange-600 shrink-0" />
      <span className="text-lg font-bold text-orange-700 tabular-nums">
        {mins}:{String(secs).padStart(2, '0')}
      </span>
      <button
        onClick={() => setRunning((r) => !r)}
        className="ml-auto text-sm font-semibold text-orange-700 border border-orange-300 rounded-lg px-3 py-1 hover:bg-orange-100 transition-colors"
      >
        {running ? 'Pause' : remaining === seconds ? 'Starten' : 'Weiter'}
      </button>
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
          <p className="text-stone-500 text-sm mt-1">Nur 2 Taps – das war's.</p>
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

export default function KochenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    const r = getRecipe(id)
    if (r) setRecipe(r)
  }, [id])

  function submitFeedback(wouldCookAgain: boolean, tooHard: boolean, tooLong: boolean) {
    const suggestion = getTodaySuggestion()
    if (suggestion) {
      saveFeedback({
        suggestionId: suggestion.id,
        recipeId: id,
        wouldCookAgain,
        tooHard,
        tooLong,
      })
      updateSuggestionStatus(suggestion.id, 'completed')
    }
    router.push('/')
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalSteps = recipe.steps.length
  const step: Step = recipe.steps[stepIndex]
  const progress = ((stepIndex + 1) / totalSteps) * 100

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-6">
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
    <div className="flex flex-col min-h-screen">
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

          {step.durationSeconds && (
            <TimerDisplay
              key={stepIndex}
              seconds={step.durationSeconds}
              onDone={() => {}}
            />
          )}

          {step.checkText && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{step.checkText}</p>
            </div>
          )}
        </div>

        {/* Substitutions for this step (if any match) */}
        {recipe.substitutions.length > 0 && (
          <details className="bg-stone-50 border border-stone-200 rounded-xl">
            <summary className="px-4 py-3 text-sm font-medium text-stone-600 cursor-pointer list-none flex items-center gap-2">
              <ChefHat size={16} className="text-stone-400" />
              Zutat ersetzen?
            </summary>
            <div className="px-4 pb-4 space-y-2">
              {recipe.substitutions.map((s, i) => (
                <p key={i} className="text-sm text-stone-600">
                  <span className="font-medium">{s.ingredient}</span> → {s.substitute}
                </p>
              ))}
            </div>
          </details>
        )}

        {/* Fixes */}
        {recipe.fixes.length > 0 && (
          <details className="bg-stone-50 border border-stone-200 rounded-xl">
            <summary className="px-4 py-3 text-sm font-medium text-stone-600 cursor-pointer list-none flex items-center gap-2">
              🆘 Etwas läuft schief?
            </summary>
            <div className="px-4 pb-4 space-y-2">
              {recipe.fixes.map((f, i) => (
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
            onClick={() => setStepIndex((i) => i - 1)}
            className="flex-1 border border-stone-300 text-stone-700 font-semibold py-4 rounded-xl hover:bg-stone-50 active:scale-95 transition-all"
          >
            Zurück
          </button>
        )}
        <button
          onClick={() => {
            if (stepIndex < totalSteps - 1) {
              setStepIndex((i) => i + 1)
            } else {
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

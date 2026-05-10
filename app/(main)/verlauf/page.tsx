'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, ChefHat, ThumbsUp, ThumbsDown } from 'lucide-react'
import { getPastSuggestions, getFeedback } from '@/lib/store'
import type { DailySuggestion, Feedback } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<string, string> = {
  completed: 'Gekocht',
  rejected: 'Übersprungen',
  accepted: 'Akzeptiert',
  pending: 'Ausstehend',
  cooking: 'Am Kochen',
}

export default function VerlaufPage() {
  const [suggestions, setSuggestions] = useState<DailySuggestion[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [s, f] = await Promise.all([getPastSuggestions(), getFeedback()])
        if (cancelled) return
        setSuggestions(s)
        setFeedbacks(f)
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const cooked = suggestions.filter((s) => s.status === 'completed' || s.status === 'accepted')

  return (
    <div className="px-4 pt-8 pb-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Bisher</h1>
        <p className="text-stone-500 mt-1">Was du bisher gekocht hast.</p>
      </div>

      {cooked.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <ChefHat size={48} className="text-stone-300" />
          <p className="text-stone-500 text-center">
            Noch nichts gekocht. Starte mit dem heutigen Vorschlag!
          </p>
          <Link
            href="/"
            className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-700 active:scale-95 transition-all"
          >
            Zum Vorschlag
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map((s) => {
            const fb = feedbacks.find((f) => f.suggestionId === s.id)
            const date = new Date(s.date).toLocaleDateString('de-DE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })

            return (
              <div
                key={s.id}
                className={cn(
                  'bg-white rounded-2xl border p-4 flex flex-col gap-2',
                  s.status === 'completed' ? 'border-stone-200' : 'border-stone-100 opacity-60',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-stone-400 mb-0.5">{date}</p>
                    <p className="font-semibold text-stone-900 text-base">
                      {s.recipe?.title ?? 'Unbekanntes Rezept'}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium px-2.5 py-1 rounded-full shrink-0',
                      s.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-stone-100 text-stone-500',
                    )}
                  >
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                </div>

                {s.recipe && (
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {s.recipe.timeMinutes} Min.
                    </span>
                  </div>
                )}

                {fb && (
                  <div className="flex items-center gap-2 mt-1">
                    {fb.wouldCookAgain ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                        <ThumbsUp size={12} /> Wieder kochen
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                        <ThumbsDown size={12} /> Nicht nochmal
                      </span>
                    )}
                    {fb.tooHard && (
                      <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-2.5 py-1">
                        Zu schwer
                      </span>
                    )}
                    {fb.tooLong && (
                      <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-2.5 py-1">
                        Zu lang
                      </span>
                    )}
                  </div>
                )}

                {s.status === 'completed' && s.recipe && (
                  <Link
                    href={`/kochen/${s.recipe.id}`}
                    className="text-sm text-orange-600 font-medium hover:text-orange-700 transition-colors mt-1"
                  >
                    Nochmal kochen →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

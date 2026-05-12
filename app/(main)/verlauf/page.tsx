'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Clock, ChefHat, ThumbsDown, ThumbsUp } from 'lucide-react'
import { getRecipeCollection, type RecipeCollectionItem } from '@/lib/store'

export default function VerlaufPage() {
  const [collection, setCollection] = useState<RecipeCollectionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const items = await getRecipeCollection()
        if (!cancelled) setCollection(items)
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

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-0 py-16">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Rezeptsammlung</h1>
        <p className="text-stone-500 mt-1">
          Alle aktiven Rezepte mit Markern für gekocht und nicht wieder kochen.
        </p>
      </div>

      {collection.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <BookOpen size={48} className="text-stone-300" />
          <p className="text-stone-500 text-center">Noch keine Rezepte vorhanden.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {collection.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900 text-base leading-snug">{recipe.title}</p>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">{recipe.description}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-stone-500 shrink-0">
                  <Clock size={13} />
                  {recipe.timeMinutes} Min.
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {recipe.cookedBefore && (
                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                    <ThumbsUp size={12} /> Schon gekocht
                  </span>
                )}
                {recipe.rejectedBefore && (
                  <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                    <ThumbsDown size={12} /> Nicht wieder kochen
                  </span>
                )}
                {!recipe.cookedBefore && !recipe.rejectedBefore && (
                  <span className="text-xs text-stone-500 bg-stone-100 rounded-full px-2.5 py-1">
                    Noch offen
                  </span>
                )}
              </div>

              <Link
                href={`/kochen/${recipe.id}`}
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
  )
}

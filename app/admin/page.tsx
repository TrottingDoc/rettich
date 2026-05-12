'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'
import { getRecipes, deleteRecipe } from '@/lib/store'
import type { Recipe } from '@/lib/types'

const CHOPPING_DE: Record<string, string> = {
  none: 'Kein Schneiden',
  basic: 'Wenig',
  lots: 'Viel',
}

export default function AdminPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const r = await getRecipes()
        if (!cancelled) setRecipes(r)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Rezepte konnten nicht geladen werden.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleDelete(id: string) {
    try {
      setError(null)
      await deleteRecipe(id)
      setRecipes(await getRecipes())
      setConfirmDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rezept konnte nicht gelöscht werden.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Rezepte</h1>
          <p className="text-stone-500 mt-1">{recipes.length} Rezepte in der Datenbank</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="text-left px-4 py-3 font-semibold text-stone-700">Rezept</th>
              <th className="text-left px-4 py-3 font-semibold text-stone-700 hidden sm:table-cell">Zeit</th>
              <th className="text-left px-4 py-3 font-semibold text-stone-700 hidden md:table-cell">Schneiden</th>
              <th className="text-left px-4 py-3 font-semibold text-stone-700 hidden lg:table-cell">Tags</th>
              <th className="text-center px-4 py-3 font-semibold text-stone-700">Aktiv</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {recipes.map((recipe) => (
              <tr key={recipe.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-4">
                  <p className="font-medium text-stone-900">{recipe.title}</p>
                  <p className="text-stone-400 text-xs mt-0.5 line-clamp-1">{recipe.description}</p>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <span className="flex items-center gap-1.5 text-stone-600">
                    <Clock size={14} />
                    {recipe.timeMinutes} Min.
                  </span>
                </td>
                <td className="px-4 py-4 hidden md:table-cell text-stone-600">
                  {CHOPPING_DE[recipe.chopping]}
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-stone-100 text-stone-600 rounded px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  {recipe.isActive ? (
                    <CheckCircle size={18} className="text-green-500 mx-auto" />
                  ) : (
                    <XCircle size={18} className="text-stone-300 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/rezepte/${recipe.id}/bearbeiten`}
                      className="p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </Link>
                    {confirmDelete === recipe.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => void handleDelete(recipe.id)}
                          className="text-xs font-medium text-red-600 border border-red-300 rounded-lg px-2 py-1 hover:bg-red-50 transition-colors"
                        >
                          Löschen
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-stone-500 border border-stone-200 rounded-lg px-2 py-1 hover:bg-stone-50 transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(recipe.id)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {recipes.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="text-base">Noch keine Rezepte. Leg los!</p>
          </div>
        )}
      </div>
    </div>
  )
}

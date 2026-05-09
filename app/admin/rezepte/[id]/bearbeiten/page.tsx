'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { getRecipe } from '@/lib/store'
import type { Recipe } from '@/lib/types'
import RezeptFormular from '@/components/RezeptFormular'

export default function BearbeitenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined)

  useEffect(() => {
    const r = getRecipe(id)
    setRecipe(r ?? null)
  }, [id])

  if (recipe === undefined) return null

  if (recipe === null) {
    router.push('/admin')
    return null
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Rezept bearbeiten</h1>
        <p className="text-stone-500 mt-1 font-medium">{recipe.title}</p>
      </div>
      <RezeptFormular recipe={recipe} />
    </div>
  )
}

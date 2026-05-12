import type { Recipe } from './types'

/**
 * Beliebte Lebensmittel für „Habe Lust auf was Bestimmtes“.
 * Treffer laufen bewusst ueber Haupt-Tags am Rezept, nicht ueber jede einzelne Zutat.
 */
export type CravingChoice = {
  id: string
  label: string
  /** Rezept-Tags, die als Hauptzutat oder Gerichtart gelten */
  tags: string[]
}

export const POPULAR_CRAVING_CHOICES: CravingChoice[] = [
  { id: 'eggs', label: 'Eier', tags: ['ei'] },
  { id: 'pasta', label: 'Nudeln / Pasta', tags: ['pasta'] },
  { id: 'tomato', label: 'Tomaten', tags: ['tomate'] },
  { id: 'cheese', label: 'Käse', tags: ['käse'] },
  { id: 'bread', label: 'Brot / Toast', tags: ['brot'] },
  { id: 'butter', label: 'Butter', tags: ['butter'] },
  { id: 'oat', label: 'Hafer / Müsli', tags: ['hafer'] },
  { id: 'milk', label: 'Milch', tags: ['milch'] },
  { id: 'potato', label: 'Kartoffeln', tags: ['kartoffel'] },
  { id: 'rice', label: 'Reis', tags: ['reis'] },
  { id: 'chicken', label: 'Geflügel / Hähnchen', tags: ['hähnchen'] },
  { id: 'fish', label: 'Fisch', tags: ['fisch'] },
  { id: 'vegetables', label: 'Gemüse', tags: ['gemüse'] },
  { id: 'vegetarian', label: 'Vegetarisch', tags: ['vegetarisch', 'vegan'] },
  { id: 'salad', label: 'Salat', tags: ['salat'] },
  { id: 'curry', label: 'Curry', tags: ['curry'] },
  { id: 'casserole', label: 'Auflauf / Ofengericht', tags: ['auflauf', 'ofengericht', 'pizza'] },
  { id: 'soup', label: 'Suppe', tags: ['suppe'] },
]

function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

/** Anzahl der gewählten Optionen, zu denen das Rezept per Haupt-Tag passt. */
export function scoreRecipeCravingMatch(recipe: Recipe, choiceIds: string[]): number {
  if (!choiceIds.length) return 0
  const tags = recipe.tags.map(normalizeIngredientName)
  let score = 0
  for (const id of choiceIds) {
    const def = POPULAR_CRAVING_CHOICES.find((c) => c.id === id)
    if (!def) continue
    if (def.tags.some((tag) => tags.includes(normalizeIngredientName(tag)))) score += 1
  }
  return score
}

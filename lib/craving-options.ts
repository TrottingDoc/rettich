import type { Recipe } from './types'

/**
 * Beliebte Lebensmittel für „Habe Lust auf was Bestimmtes“.
 * Keywords werden kleinschriftig gegen Zutaten-Namen gematcht (Substring).
 */
export type CravingChoice = {
  id: string
  label: string
  /** Teilstrings für Abgleich mit ingredient.name (bereits normalisiert) */
  keywords: string[]
}

export const POPULAR_CRAVING_CHOICES: CravingChoice[] = [
  { id: 'eggs', label: 'Eier', keywords: ['ei', 'eier'] },
  { id: 'pasta', label: 'Nudeln / Pasta', keywords: ['nudel', 'pasta', 'spaghetti', 'penne', 'lasagne'] },
  { id: 'tomato', label: 'Tomaten', keywords: ['tomat'] },
  { id: 'cheese', label: 'Käse', keywords: ['käse', 'parmesan', 'mozzarella', 'feta', 'gouda'] },
  { id: 'bread', label: 'Brot / Toast', keywords: ['brot', 'toast', 'brötchen', 'baguette'] },
  { id: 'butter', label: 'Butter', keywords: ['butter', 'margarine'] },
  { id: 'oat', label: 'Hafer / Müsli', keywords: ['hafer', 'müsli', 'cornflakes'] },
  { id: 'milk', label: 'Milch', keywords: ['milch', 'sahne', 'joghurt', 'quark'] },
  { id: 'potato', label: 'Kartoffeln', keywords: ['kartoffel', 'püree'] },
  { id: 'rice', label: 'Reis', keywords: ['reis'] },
  { id: 'chicken', label: 'Geflügel / Hähnchen', keywords: ['hähnchen', 'huhn', 'pute', 'geflügel'] },
  { id: 'fish', label: 'Fisch', keywords: ['fisch', 'lachs', 'thunfisch', 'dorsch'] },
  { id: 'vegetables', label: 'Gemüse', keywords: ['gurke', 'paprika', 'zucchini', 'brokkoli', 'salat', 'karotte', 'zwiebel'] },
  { id: 'soup', label: 'Suppe', keywords: ['suppe', 'eintopf'] },
]

function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

/** Anzahl der gewählten Optionen, zu denen das Rezept passende Zutaten hat. */
export function scoreRecipeCravingMatch(recipe: Recipe, choiceIds: string[]): number {
  if (!choiceIds.length) return 0
  const names = recipe.ingredients.map((i) => normalizeIngredientName(i.name))
  let score = 0
  for (const id of choiceIds) {
    const def = POPULAR_CRAVING_CHOICES.find((c) => c.id === id)
    if (!def) continue
    const hit = names.some((n) => def.keywords.some((kw) => n.includes(normalizeIngredientName(kw))))
    if (hit) score += 1
  }
  return score
}

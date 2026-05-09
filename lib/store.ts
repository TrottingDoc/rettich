'use client'

import type { Recipe, DailySuggestion, Feedback, Profile } from './types'
import { MOCK_RECIPES, DEFAULT_PROFILE } from './mock-data'

const KEYS = {
  recipes: 'rettich_recipes',
  suggestions: 'rettich_suggestions',
  feedback: 'rettich_feedback',
  profile: 'rettich_profile',
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Recipes

export function getRecipes(): Recipe[] {
  return load(KEYS.recipes, MOCK_RECIPES)
}

export function getRecipe(id: string): Recipe | undefined {
  return getRecipes().find((r) => r.id === id)
}

export function saveRecipe(recipe: Recipe) {
  const recipes = getRecipes()
  const idx = recipes.findIndex((r) => r.id === recipe.id)
  if (idx >= 0) {
    recipes[idx] = recipe
  } else {
    recipes.push(recipe)
  }
  save(KEYS.recipes, recipes)
}

export function deleteRecipe(id: string) {
  save(
    KEYS.recipes,
    getRecipes().filter((r) => r.id !== id),
  )
}

// Profile

export function getProfile(): Profile {
  const stored = load<Partial<Profile>>(KEYS.profile, {})
  return { ...DEFAULT_PROFILE, ...stored }
}

export function saveProfile(profile: Profile) {
  save(KEYS.profile, profile)
}

// Daily suggestion

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

/** Kalenderdatum für „morgen“ (lokal wie ISO-Datum). */
export function tomorrowStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function getTodaySuggestion(): DailySuggestion | null {
  const suggestions = load<DailySuggestion[]>(KEYS.suggestions, [])
  return suggestions.find((s) => s.date === todayStr()) ?? null
}

export function getSuggestionByDate(isoDate: string): DailySuggestion | null {
  const suggestions = load<DailySuggestion[]>(KEYS.suggestions, [])
  const row = suggestions.find((s) => s.date === isoDate)
  if (!row) return null
  const recipe = getRecipe(row.recipeId)
  return recipe ? { ...row, recipe } : null
}

/**
 * Liefert den Vorschlag für ein Datum; legt ihn bei Bedarf neu an (gleiche Logik wie bisher für „heute“).
 */
export function getOrCreateSuggestionForDate(targetDate: string): DailySuggestion | null {
  const suggestions = load<DailySuggestion[]>(KEYS.suggestions, [])
  const existing = suggestions.find((s) => s.date === targetDate)
  if (existing) {
    const recipe = getRecipe(existing.recipeId)
    if (!recipe) return null
    return { ...existing, recipe }
  }

  const profile = getProfile()
  const recipes = getRecipes().filter((r) => r.isActive && r.timeMinutes <= profile.maxTimeMinutes)
  if (!recipes.length) return null

  const recentIds = new Set(suggestions.slice(-7).map((s) => s.recipeId))
  let pool = recipes.filter((r) => !recentIds.has(r.id))
  if (!pool.length) pool = recipes

  const todayRow = suggestions.find((s) => s.date === todayStr())
  if (todayRow && pool.length > 1) {
    const avoidToday = pool.filter((r) => r.id !== todayRow.recipeId)
    if (avoidToday.length) pool = avoidToday
  }

  const recipe = pool[Math.floor(Math.random() * pool.length)]!

  const suggestion: DailySuggestion = {
    id: crypto.randomUUID(),
    date: targetDate,
    recipeId: recipe.id,
    recipe,
    status: 'pending',
  }

  save(KEYS.suggestions, [...suggestions, suggestion])
  return suggestion
}

export function createTodaySuggestion(): DailySuggestion {
  const existing = getTodaySuggestion()
  if (existing) {
    const recipe = getRecipe(existing.recipeId)
    return recipe ? { ...existing, recipe } : existing
  }

  const created = getOrCreateSuggestionForDate(todayStr())
  if (created) return created

  return { id: crypto.randomUUID(), date: todayStr(), recipeId: '', status: 'pending' }
}

export function updateSuggestionStatus(
  id: string,
  status: DailySuggestion['status'],
  rejectionReason?: string,
) {
  const suggestions = load<DailySuggestion[]>(KEYS.suggestions, [])
  const updated = suggestions.map((s) =>
    s.id === id ? { ...s, status, rejectionReason } : s,
  )
  save(KEYS.suggestions, updated)
}

export function getAlternativeSuggestion(excludeId: string): Recipe | null {
  const profile = getProfile()
  const recipes = getRecipes().filter(
    (r) => r.isActive && r.id !== excludeId && r.timeMinutes <= profile.maxTimeMinutes,
  )
  if (!recipes.length) return null
  return recipes[Math.floor(Math.random() * recipes.length)]
}

export function getSimplerSuggestion(currentRecipe: Recipe): Recipe | null {
  const recipes = getRecipes().filter(
    (r) =>
      r.isActive &&
      r.id !== currentRecipe.id &&
      r.timeMinutes <= currentRecipe.timeMinutes &&
      r.ingredientCount <= currentRecipe.ingredientCount,
  )
  if (!recipes.length) return null
  return recipes.sort((a, b) => a.timeMinutes - b.timeMinutes)[0]
}

// Feedback

export function getFeedback(): Feedback[] {
  return load<Feedback[]>(KEYS.feedback, [])
}

export function saveFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>) {
  const all = getFeedback()
  const entry: Feedback = {
    ...feedback,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  save(KEYS.feedback, [...all, entry])
}

export function getPastSuggestions(): DailySuggestion[] {
  const suggestions = load<DailySuggestion[]>(KEYS.suggestions, [])
  const recipes = getRecipes()
  return suggestions
    .map((s) => ({ ...s, recipe: recipes.find((r) => r.id === s.recipeId) }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

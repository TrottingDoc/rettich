'use client'

import type {
  Recipe,
  DailySuggestion,
  Feedback,
  Profile,
  AlternativeSurveyReason,
  AlternativeSurveyEntry,
  RecommendationSignals,
} from './types'
import { MOCK_RECIPES, DEFAULT_PROFILE } from './mock-data'
import { scoreRecipeCravingMatch } from './craving-options'

const KEYS = {
  recipes: 'rettich_recipes',
  suggestions: 'rettich_suggestions',
  feedback: 'rettich_feedback',
  profile: 'rettich_profile',
  alternativeSurveys: 'rettich_alternative_surveys',
  recommendationSignals: 'rettich_recommendation_signals',
}

const DEFAULT_SIGNALS: RecommendationSignals = {
  timeMinutesCap: null,
  ingredientCountCap: null,
  panCountCap: null,
  dislikedRecipeIds: [],
}

type RelaxFlags = {
  ignorePanCap?: boolean
  ignoreIngredientCap?: boolean
  ignoreTimeSignal?: boolean
  ignoreDisliked?: boolean
}

const RELAXATION_STEPS: RelaxFlags[] = [
  {},
  { ignorePanCap: true },
  { ignorePanCap: true, ignoreIngredientCap: true },
  { ignorePanCap: true, ignoreIngredientCap: true, ignoreTimeSignal: true },
  { ignorePanCap: true, ignoreIngredientCap: true, ignoreTimeSignal: true, ignoreDisliked: true },
]

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
  const stored = load<Record<string, unknown>>(KEYS.profile, {})
  return {
    portions:
      typeof stored.portions === 'number' ? stored.portions : DEFAULT_PROFILE.portions,
    maxTimeMinutes:
      typeof stored.maxTimeMinutes === 'number'
        ? stored.maxTimeMinutes
        : DEFAULT_PROFILE.maxTimeMinutes,
    allergies: Array.isArray(stored.allergies)
      ? (stored.allergies as string[])
      : DEFAULT_PROFILE.allergies,
    dislikes: Array.isArray(stored.dislikes)
      ? (stored.dislikes as string[])
      : DEFAULT_PROFILE.dislikes,
    equipment: Array.isArray(stored.equipment)
      ? (stored.equipment as string[])
      : DEFAULT_PROFILE.equipment,
    notificationHour: (() => {
      const h =
        typeof stored.notificationHour === 'number'
          ? stored.notificationHour
          : DEFAULT_PROFILE.notificationHour
      const allowed = [8, 9, 10] as const
      return allowed.includes(h as (typeof allowed)[number]) ? h : DEFAULT_PROFILE.notificationHour
    })(),
  }
}

export function saveProfile(profile: Profile) {
  save(KEYS.profile, profile)
}

// --- „Etwas anderes“-Umfrage & Empfehlungs-Signale (localStorage; Schema in supabase/schema.sql) ---

export function getRecommendationSignals(): RecommendationSignals {
  const raw = load<Partial<RecommendationSignals>>(KEYS.recommendationSignals, {})
  return {
    timeMinutesCap:
      typeof raw.timeMinutesCap === 'number' ? raw.timeMinutesCap : DEFAULT_SIGNALS.timeMinutesCap,
    ingredientCountCap:
      typeof raw.ingredientCountCap === 'number'
        ? raw.ingredientCountCap
        : DEFAULT_SIGNALS.ingredientCountCap,
    panCountCap:
      typeof raw.panCountCap === 'number' ? raw.panCountCap : DEFAULT_SIGNALS.panCountCap,
    dislikedRecipeIds: Array.isArray(raw.dislikedRecipeIds)
      ? raw.dislikedRecipeIds
      : DEFAULT_SIGNALS.dislikedRecipeIds,
  }
}

function saveRecommendationSignals(signals: RecommendationSignals) {
  save(KEYS.recommendationSignals, signals)
}

export function getAlternativeSurveyEntries(): AlternativeSurveyEntry[] {
  return load<AlternativeSurveyEntry[]>(KEYS.alternativeSurveys, [])
}

/** Reine Berechnung: welche Signale gelten nach einer Umfrage-Antwort (ohne Speichern). */
export function deriveRecommendationSignalsAfterReason(
  prev: RecommendationSignals,
  recipe: Recipe,
  reason: AlternativeSurveyReason,
): RecommendationSignals {
  const profile = getProfile()
  const signals: RecommendationSignals = {
    timeMinutesCap: prev.timeMinutesCap,
    ingredientCountCap: prev.ingredientCountCap,
    panCountCap: prev.panCountCap,
    dislikedRecipeIds: [...prev.dislikedRecipeIds],
  }

  switch (reason) {
    case 'faster': {
      const target = Math.max(10, Math.min(recipe.timeMinutes - 5, profile.maxTimeMinutes))
      signals.timeMinutesCap =
        signals.timeMinutesCap != null ? Math.min(signals.timeMinutesCap, target) : target
      break
    }
    case 'fewer_ingredients': {
      const target = Math.max(3, recipe.ingredientCount - 1)
      signals.ingredientCountCap =
        signals.ingredientCountCap != null
          ? Math.min(signals.ingredientCountCap, target)
          : target
      break
    }
    case 'fewer_utensils': {
      const target = Math.max(1, recipe.panCount - 1)
      signals.panCountCap =
        signals.panCountCap != null ? Math.min(signals.panCountCap, target) : target
      break
    }
    case 'dislike': {
      if (!signals.dislikedRecipeIds.includes(recipe.id)) {
        signals.dislikedRecipeIds.push(recipe.id)
      }
      break
    }
    case 'specific_craving':
      break
    default:
      break
  }

  return signals
}

/** Bevorzugt Rezepte, deren Zutaten zu den gewählten „Lüsten“ passen; sonst ein beliebiges passendes Ersatzrezept. */
function pickRecipeForSpecificCraving(
  excludeRecipeId: string,
  signals: RecommendationSignals,
  cravingChoiceIds: string[],
): Recipe | null {
  const exclude = new Set([excludeRecipeId])
  for (const relax of RELAXATION_STEPS) {
    const matched = getRecipes().filter((r) => recipeMatchesRelax(r, exclude, relax, signals))
    const scored = matched
      .map((r) => ({ r, score: scoreRecipeCravingMatch(r, cravingChoiceIds) }))
      .filter(({ score }) => score > 0)
    if (scored.length) {
      const best = Math.max(...scored.map((x) => x.score))
      const top = scored.filter((x) => x.score === best).map((x) => x.r)
      return top[Math.floor(Math.random() * top.length)]!
    }
  }
  const pool = pickRecipesMatchingSignals(exclude, signals)
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]!
}

export type ApplySomethingElseOptions = {
  cravingChoiceIds?: string[]
}

function recipeMatchesRelax(
  r: Recipe,
  excludeIds: Set<string>,
  relax: RelaxFlags,
  signals: RecommendationSignals,
): boolean {
  if (!r.isActive || excludeIds.has(r.id)) return false

  const profile = getProfile()

  let timeMax = profile.maxTimeMinutes
  if (!relax.ignoreTimeSignal && signals.timeMinutesCap != null) {
    timeMax = Math.min(timeMax, signals.timeMinutesCap)
  }
  if (r.timeMinutes > timeMax) return false

  if (!relax.ignoreIngredientCap && signals.ingredientCountCap != null) {
    if (r.ingredientCount > signals.ingredientCountCap) return false
  }

  if (!relax.ignorePanCap && signals.panCountCap != null) {
    if (r.panCount > signals.panCountCap) return false
  }

  if (!relax.ignoreDisliked && signals.dislikedRecipeIds.includes(r.id)) return false

  return true
}

/**
 * Pool gemäß Profil + Signale (optional overrides gespeicherte Werte); bei leerem Treffer Lockerung.
 */
export function pickRecipesMatchingSignals(
  excludeIds: Set<string>,
  signalsOverride?: RecommendationSignals,
): Recipe[] {
  const signalsBase = signalsOverride ?? getRecommendationSignals()
  for (const relax of RELAXATION_STEPS) {
    const list = getRecipes().filter((r) => recipeMatchesRelax(r, excludeIds, relax, signalsBase))
    if (list.length) return list
  }
  const profile = getProfile()
  return getRecipes().filter(
    (r) => r.isActive && !excludeIds.has(r.id) && r.timeMinutes <= profile.maxTimeMinutes,
  )
}

export function pickRecipeMatchingSignals(excludeRecipeId: string): Recipe | null {
  const pool = pickRecipesMatchingSignals(new Set([excludeRecipeId]))
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]!
}

/**
 * Nach Umfrage: erst prüfen, ob ein Ersatz existiert; dann Umfrage + Signale persistieren.
 * Bei `specific_craving` sind `cravingChoiceIds` (mind. eine ID) nötig.
 */
export function applySomethingElse(
  suggestion: DailySuggestion,
  recipe: Recipe,
  reason: AlternativeSurveyReason,
  options?: ApplySomethingElseOptions,
): DailySuggestion | null {
  const cravingIds =
    reason === 'specific_craving' ? (options?.cravingChoiceIds?.filter(Boolean) ?? []) : []
  if (reason === 'specific_craving' && cravingIds.length === 0) return null

  const prevSignals = getRecommendationSignals()
  const nextSignals = deriveRecommendationSignalsAfterReason(prevSignals, recipe, reason)

  let nextRecipe: Recipe | null = null
  if (reason === 'specific_craving') {
    nextRecipe = pickRecipeForSpecificCraving(recipe.id, nextSignals, cravingIds)
  } else {
    const pool = pickRecipesMatchingSignals(new Set([recipe.id]), nextSignals)
    if (!pool.length) return null
    nextRecipe = pool[Math.floor(Math.random() * pool.length)]!
  }

  if (!nextRecipe) return null

  const entry: AlternativeSurveyEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    suggestionId: suggestion.id,
    recipeId: recipe.id,
    reason,
    recipeTimeMinutes: recipe.timeMinutes,
    recipeIngredientCount: recipe.ingredientCount,
    recipePanCount: recipe.panCount,
    ...(reason === 'specific_craving' && cravingIds.length ? { cravingChoiceIds: cravingIds } : {}),
  }
  save(KEYS.alternativeSurveys, [...getAlternativeSurveyEntries(), entry])
  saveRecommendationSignals(nextSignals)

  const suggestions = load<DailySuggestion[]>(KEYS.suggestions, [])
  const idx = suggestions.findIndex((s) => s.id === suggestion.id)
  if (idx < 0) return null

  const updated: DailySuggestion = {
    ...suggestions[idx],
    recipeId: nextRecipe.id,
    status: 'pending',
    rejectionReason: undefined,
  }
  const next = [...suggestions]
  next[idx] = updated
  save(KEYS.suggestions, next)
  return { ...updated, recipe: nextRecipe }
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

  const basePool = pickRecipesMatchingSignals(new Set())
  if (!basePool.length) return null

  const recentIds = new Set(suggestions.slice(-7).map((s) => s.recipeId))
  let pool = basePool.filter((r) => !recentIds.has(r.id))
  if (!pool.length) pool = basePool

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
  return pickRecipeMatchingSignals(excludeId)
}

/**
 * Aktuelles Tagesgericht für morgen einplanen und für heute einen anderen Vorschlag wählen.
 */
export function deferCurrentDayToTomorrowAndPickNewToday(): DailySuggestion | null {
  const suggestions = load<DailySuggestion[]>(KEYS.suggestions, [])
  const today = todayStr()
  const tomorrow = tomorrowStr()

  const todayIdx = suggestions.findIndex((s) => s.date === today)
  if (todayIdx < 0) return null

  const todayRow = suggestions[todayIdx]
  const moveRecipeId = todayRow.recipeId
  if (!moveRecipeId) return null

  let next = [...suggestions]

  const tomorrowIdx = next.findIndex((s) => s.date === tomorrow)
  if (tomorrowIdx >= 0) {
    next[tomorrowIdx] = {
      ...next[tomorrowIdx],
      recipeId: moveRecipeId,
      status: 'pending',
      rejectionReason: undefined,
    }
  } else {
    next.push({
      id: crypto.randomUUID(),
      date: tomorrow,
      recipeId: moveRecipeId,
      status: 'pending',
    })
  }

  const alt = getAlternativeSuggestion(moveRecipeId)
  const newTodayId = alt?.id ?? moveRecipeId

  const todayIdxFresh = next.findIndex((s) => s.date === today)
  if (todayIdxFresh < 0) return null

  next[todayIdxFresh] = {
    ...next[todayIdxFresh],
    recipeId: newTodayId,
    status: 'pending',
    rejectionReason: undefined,
  }

  save(KEYS.suggestions, next)

  const recipe = getRecipe(newTodayId)
  const row = next.find((s) => s.date === today)!
  return recipe ? { ...row, recipe } : null
}

/** Morgen-Vorschlag durch ein anderes aktives Rezept ersetzen (bevorzugt ≠ heute & ≠ bisheriges Morgen). */
export function refreshTomorrowSuggestion(): DailySuggestion | null {
  const tomorrow = tomorrowStr()
  const suggestions = load<DailySuggestion[]>(KEYS.suggestions, [])

  const tomorrowIdx = suggestions.findIndex((s) => s.date === tomorrow)
  const todayRow = suggestions.find((s) => s.date === todayStr())

  const exclude = new Set<string>()
  if (todayRow?.recipeId) exclude.add(todayRow.recipeId)
  if (tomorrowIdx >= 0 && suggestions[tomorrowIdx].recipeId) {
    exclude.add(suggestions[tomorrowIdx].recipeId)
  }

  let pool = pickRecipesMatchingSignals(exclude)
  if (!pool.length && tomorrowIdx >= 0 && suggestions[tomorrowIdx].recipeId) {
    pool = pickRecipesMatchingSignals(new Set([suggestions[tomorrowIdx].recipeId]))
  }
  if (!pool.length) {
    return getSuggestionByDate(tomorrow)
  }

  const recipe = pool[Math.floor(Math.random() * pool.length)]!

  const updatedRow: DailySuggestion =
    tomorrowIdx >= 0
      ? {
          ...suggestions[tomorrowIdx],
          recipeId: recipe.id,
          status: 'pending',
          rejectionReason: undefined,
        }
      : {
          id: crypto.randomUUID(),
          date: tomorrow,
          recipeId: recipe.id,
          status: 'pending',
        }

  const next =
    tomorrowIdx >= 0
      ? suggestions.map((s, i) => (i === tomorrowIdx ? updatedRow : s))
      : [...suggestions, updatedRow]

  save(KEYS.suggestions, next)
  return { ...updatedRow, recipe }
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

'use client'

import { createClient } from './supabase/client'
import type {
  Recipe,
  DailySuggestion,
  Feedback,
  Profile,
  AlternativeSurveyReason,
  AlternativeSurveyEntry,
  RecommendationSignals,
} from './types'
import { scoreRecipeCravingMatch } from './craving-options'
import { NOTIFICATION_HOURS } from './profile-options'

// =============================================================================
// Mapping snake_case (DB) <-> camelCase (App)
// =============================================================================

type RecipeRow = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  time_minutes: number
  portions: number | null
  chopping: 'none' | 'basic' | 'lots' | null
  uses_stove: boolean | null
  uses_oven: boolean | null
  requires_multitasking: boolean | null
  ingredient_count: number | null
  pan_count: number | null
  can_walk_away: boolean | null
  tags: string[] | null
  ingredients: Recipe['ingredients']
  steps: Recipe['steps']
  substitutions: Recipe['substitutions'] | null
  fixes: Recipe['fixes'] | null
  is_active: boolean | null
  created_at: string
}

function mapRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    imageUrl: row.image_url ?? undefined,
    timeMinutes: row.time_minutes,
    portions: row.portions ?? 1,
    chopping: row.chopping ?? 'none',
    usesStove: row.uses_stove ?? false,
    usesOven: row.uses_oven ?? false,
    requiresMultitasking: row.requires_multitasking ?? false,
    ingredientCount: row.ingredient_count ?? 0,
    panCount: row.pan_count ?? 1,
    canWalkAway: row.can_walk_away ?? false,
    tags: row.tags ?? [],
    ingredients: row.ingredients ?? [],
    steps: row.steps ?? [],
    substitutions: row.substitutions ?? [],
    fixes: row.fixes ?? [],
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  }
}

function recipeToRow(r: Recipe): Omit<RecipeRow, 'id' | 'created_at'> & { id?: string } {
  return {
    ...(r.id ? { id: r.id } : {}),
    title: r.title,
    description: r.description,
    image_url: r.imageUrl ?? null,
    time_minutes: r.timeMinutes,
    portions: r.portions,
    chopping: r.chopping,
    uses_stove: r.usesStove,
    uses_oven: r.usesOven,
    requires_multitasking: r.requiresMultitasking,
    ingredient_count: r.ingredientCount,
    pan_count: r.panCount,
    can_walk_away: r.canWalkAway,
    tags: r.tags,
    ingredients: r.ingredients,
    steps: r.steps,
    substitutions: r.substitutions,
    fixes: r.fixes,
    is_active: r.isActive,
  }
}

type ProfileRow = {
  id: string
  user_id: string
  portions: number | null
  max_time_minutes: number | null
  allergies: string[] | null
  dislikes: string[] | null
  equipment: string[] | null
  notification_hour: number | null
  onboarding_completed: boolean | null
}

const DEFAULT_PROFILE: Profile = {
  portions: 2,
  maxTimeMinutes: 60,
  allergies: [],
  dislikes: [],
  equipment: ['Herd', 'Toaster'],
  notificationHour: 10,
  onboardingCompleted: false,
}

function mapProfile(row: ProfileRow | null): Profile {
  if (!row) return DEFAULT_PROFILE
  const h = row.notification_hour ?? DEFAULT_PROFILE.notificationHour
  return {
    portions: row.portions ?? DEFAULT_PROFILE.portions,
    maxTimeMinutes: row.max_time_minutes ?? DEFAULT_PROFILE.maxTimeMinutes,
    allergies: row.allergies ?? [],
    dislikes: row.dislikes ?? [],
    equipment: row.equipment ?? DEFAULT_PROFILE.equipment,
    notificationHour: NOTIFICATION_HOURS.includes(h as (typeof NOTIFICATION_HOURS)[number])
      ? h
      : DEFAULT_PROFILE.notificationHour,
    onboardingCompleted: row.onboarding_completed ?? DEFAULT_PROFILE.onboardingCompleted,
  }
}

type SuggestionRow = {
  id: string
  user_id: string
  date: string
  recipe_id: string | null
  status: DailySuggestion['status']
  rejection_reason: string | null
}

function mapSuggestion(row: SuggestionRow): DailySuggestion {
  return {
    id: row.id,
    date: row.date,
    recipeId: row.recipe_id ?? '',
    status: row.status,
    rejectionReason: row.rejection_reason ?? undefined,
  }
}

type SignalsRow = {
  user_id: string
  time_minutes_cap: number | null
  ingredient_count_cap: number | null
  pan_count_cap: number | null
  disliked_recipe_ids: string[] | null
}

const DEFAULT_SIGNALS: RecommendationSignals = {
  timeMinutesCap: null,
  ingredientCountCap: null,
  panCountCap: null,
  dislikedRecipeIds: [],
}

function mapSignals(row: SignalsRow | null): RecommendationSignals {
  if (!row) return DEFAULT_SIGNALS
  return {
    timeMinutesCap: row.time_minutes_cap,
    ingredientCountCap: row.ingredient_count_cap,
    panCountCap: row.pan_count_cap,
    dislikedRecipeIds: row.disliked_recipe_ids ?? [],
  }
}

type FeedbackRow = {
  id: string
  user_id: string
  suggestion_id: string | null
  recipe_id: string | null
  would_cook_again: boolean | null
  too_hard: boolean | null
  too_long: boolean | null
  created_at: string
}

function mapFeedback(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    suggestionId: row.suggestion_id ?? '',
    recipeId: row.recipe_id ?? '',
    wouldCookAgain: row.would_cook_again ?? false,
    tooHard: row.too_hard ?? false,
    tooLong: row.too_long ?? false,
    createdAt: row.created_at,
  }
}

type SurveyRow = {
  id: string
  user_id: string
  created_at: string
  suggestion_id: string | null
  recipe_id: string | null
  reason: AlternativeSurveyReason
  recipe_time_minutes: number
  recipe_ingredient_count: number
  recipe_pan_count: number
  craving_choice_ids: string[] | null
}

function mapSurvey(row: SurveyRow): AlternativeSurveyEntry {
  return {
    id: row.id,
    createdAt: row.created_at,
    suggestionId: row.suggestion_id ?? '',
    recipeId: row.recipe_id ?? '',
    reason: row.reason,
    recipeTimeMinutes: row.recipe_time_minutes,
    recipeIngredientCount: row.recipe_ingredient_count,
    recipePanCount: row.recipe_pan_count,
    ...(row.craving_choice_ids?.length ? { cravingChoiceIds: row.craving_choice_ids } : {}),
  }
}

// =============================================================================
// Auth helper
// =============================================================================

async function requireUserId(): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Not authenticated')
  return data.user.id
}

// =============================================================================
// Recipes
// =============================================================================

export async function getRecipes(): Promise<Recipe[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as RecipeRow[] | null)?.map(mapRecipe) ?? []
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? mapRecipe(data as RecipeRow) : null
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const supabase = createClient()
  const row = recipeToRow(recipe)
  if (recipe.id) {
    const { error } = await supabase.from('recipes').update(row).eq('id', recipe.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('recipes').insert(row)
    if (error) throw error
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) throw error
}

// =============================================================================
// Profile
// =============================================================================

export async function getProfile(): Promise<Profile> {
  const userId = await requireUserId()
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return mapProfile((data as ProfileRow | null) ?? null)
}

export async function saveProfile(profile: Profile): Promise<void> {
  const userId = await requireUserId()
  const supabase = createClient()
  const { error } = await supabase
    .from('profile')
    .upsert(
      {
        user_id: userId,
        portions: profile.portions,
        max_time_minutes: profile.maxTimeMinutes,
        allergies: profile.allergies,
        dislikes: profile.dislikes,
        equipment: profile.equipment,
        notification_hour: profile.notificationHour,
        onboarding_completed: profile.onboardingCompleted,
      },
      { onConflict: 'user_id' },
    )
  if (error) throw error
}

// =============================================================================
// Recommendation signals (per User)
// =============================================================================

export async function getRecommendationSignals(): Promise<RecommendationSignals> {
  const userId = await requireUserId()
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recommendation_signals')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return mapSignals((data as SignalsRow | null) ?? null)
}

async function saveRecommendationSignals(signals: RecommendationSignals): Promise<void> {
  const userId = await requireUserId()
  const supabase = createClient()
  const { error } = await supabase
    .from('recommendation_signals')
    .upsert(
      {
        user_id: userId,
        time_minutes_cap: signals.timeMinutesCap,
        ingredient_count_cap: signals.ingredientCountCap,
        pan_count_cap: signals.panCountCap,
        disliked_recipe_ids: signals.dislikedRecipeIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
  if (error) throw error
}

export async function getAlternativeSurveyEntries(): Promise<AlternativeSurveyEntry[]> {
  const userId = await requireUserId()
  const supabase = createClient()
  const { data, error } = await supabase
    .from('alternative_surveys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as SurveyRow[] | null)?.map(mapSurvey) ?? []
}

// =============================================================================
// Pure logic (synchron, ohne DB) – Recommendation Engine
// =============================================================================

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

export function deriveRecommendationSignalsAfterReason(
  prev: RecommendationSignals,
  recipe: Recipe,
  reason: AlternativeSurveyReason,
  profile: Profile,
): RecommendationSignals {
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
    default:
      break
  }

  return signals
}

function recipeMatchesRelax(
  r: Recipe,
  excludeIds: Set<string>,
  relax: RelaxFlags,
  signals: RecommendationSignals,
  profile: Profile,
): boolean {
  if (!r.isActive || excludeIds.has(r.id)) return false

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

export function pickRecipesMatchingSignals(
  recipes: Recipe[],
  excludeIds: Set<string>,
  signals: RecommendationSignals,
  profile: Profile,
): Recipe[] {
  for (const relax of RELAXATION_STEPS) {
    const list = recipes.filter((r) => recipeMatchesRelax(r, excludeIds, relax, signals, profile))
    if (list.length) return list
  }
  return recipes.filter(
    (r) => r.isActive && !excludeIds.has(r.id) && r.timeMinutes <= profile.maxTimeMinutes,
  )
}

function pickRecipeForSpecificCraving(
  recipes: Recipe[],
  excludeRecipeId: string,
  signals: RecommendationSignals,
  profile: Profile,
  cravingChoiceIds: string[],
): Recipe | null {
  const exclude = new Set([excludeRecipeId])
  for (const relax of RELAXATION_STEPS) {
    const matched = recipes.filter((r) => recipeMatchesRelax(r, exclude, relax, signals, profile))
    const scored = matched
      .map((r) => ({ r, score: scoreRecipeCravingMatch(r, cravingChoiceIds) }))
      .filter(({ score }) => score > 0)
    if (scored.length) {
      const best = Math.max(...scored.map((x) => x.score))
      const top = scored.filter((x) => x.score === best).map((x) => x.r)
      return top[Math.floor(Math.random() * top.length)]!
    }
  }
  const pool = pickRecipesMatchingSignals(recipes, exclude, signals, profile)
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]!
}

// =============================================================================
// Daily suggestions
// =============================================================================

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function tomorrowStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

async function fetchSuggestions(userId: string): Promise<DailySuggestion[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('daily_suggestions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  if (error) throw error
  return (data as SuggestionRow[] | null)?.map(mapSuggestion) ?? []
}

async function attachRecipe(s: DailySuggestion): Promise<DailySuggestion> {
  if (!s.recipeId) return s
  const recipe = await getRecipe(s.recipeId)
  return recipe ? { ...s, recipe } : s
}

export async function getTodaySuggestion(): Promise<DailySuggestion | null> {
  const userId = await requireUserId()
  const supabase = createClient()
  const { data, error } = await supabase
    .from('daily_suggestions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', todayStr())
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return attachRecipe(mapSuggestion(data as SuggestionRow))
}

export async function getSuggestionByDate(isoDate: string): Promise<DailySuggestion | null> {
  const userId = await requireUserId()
  const supabase = createClient()
  const { data, error } = await supabase
    .from('daily_suggestions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', isoDate)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return attachRecipe(mapSuggestion(data as SuggestionRow))
}

/**
 * Liefert den Vorschlag für ein Datum; legt ihn bei Bedarf neu an.
 */
export async function getOrCreateSuggestionForDate(
  targetDate: string,
): Promise<DailySuggestion | null> {
  const userId = await requireUserId()
  const existing = await getSuggestionByDate(targetDate)
  if (existing?.recipe) return existing
  if (existing) return existing

  const [recipes, profile, signals, suggestions] = await Promise.all([
    getRecipes(),
    getProfile(),
    getRecommendationSignals(),
    fetchSuggestions(userId),
  ])
  if (!recipes.length) return null

  const basePool = pickRecipesMatchingSignals(recipes, new Set(), signals, profile)
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

  const supabase = createClient()
  const { data, error } = await supabase
    .from('daily_suggestions')
    .insert({
      user_id: userId,
      date: targetDate,
      recipe_id: recipe.id,
      status: 'pending',
    })
    .select('*')
    .single()
  if (error) throw error

  return { ...mapSuggestion(data as SuggestionRow), recipe }
}

export async function createTodaySuggestion(): Promise<DailySuggestion | null> {
  return getOrCreateSuggestionForDate(todayStr())
}

export async function updateSuggestionStatus(
  id: string,
  status: DailySuggestion['status'],
  rejectionReason?: string,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('daily_suggestions')
    .update({ status, rejection_reason: rejectionReason ?? null })
    .eq('id', id)
  if (error) throw error
}

/** Morgen-Vorschlag durch ein anderes aktives Rezept ersetzen. */
export async function refreshTomorrowSuggestion(): Promise<DailySuggestion | null> {
  const userId = await requireUserId()
  const tomorrow = tomorrowStr()
  const today = todayStr()

  const [recipes, profile, signals, suggestions] = await Promise.all([
    getRecipes(),
    getProfile(),
    getRecommendationSignals(),
    fetchSuggestions(userId),
  ])

  const todayRow = suggestions.find((s) => s.date === today)
  const tomorrowRow = suggestions.find((s) => s.date === tomorrow)

  const exclude = new Set<string>()
  if (todayRow?.recipeId) exclude.add(todayRow.recipeId)
  if (tomorrowRow?.recipeId) exclude.add(tomorrowRow.recipeId)

  let pool = pickRecipesMatchingSignals(recipes, exclude, signals, profile)
  if (!pool.length && tomorrowRow?.recipeId) {
    pool = pickRecipesMatchingSignals(recipes, new Set([tomorrowRow.recipeId]), signals, profile)
  }
  if (!pool.length) {
    return tomorrowRow ? attachRecipe(tomorrowRow) : null
  }

  const recipe = pool[Math.floor(Math.random() * pool.length)]!

  const supabase = createClient()
  if (tomorrowRow) {
    const { data, error } = await supabase
      .from('daily_suggestions')
      .update({
        recipe_id: recipe.id,
        status: 'pending',
        rejection_reason: null,
      })
      .eq('id', tomorrowRow.id)
      .select('*')
      .single()
    if (error) throw error
    return { ...mapSuggestion(data as SuggestionRow), recipe }
  }

  const { data, error } = await supabase
    .from('daily_suggestions')
    .insert({
      user_id: userId,
      date: tomorrow,
      recipe_id: recipe.id,
      status: 'pending',
    })
    .select('*')
    .single()
  if (error) throw error
  return { ...mapSuggestion(data as SuggestionRow), recipe }
}

/** Aktuelles Tagesgericht für morgen einplanen und für heute einen anderen Vorschlag wählen. */
export async function deferCurrentDayToTomorrowAndPickNewToday(): Promise<DailySuggestion | null> {
  const userId = await requireUserId()
  const today = todayStr()
  const tomorrow = tomorrowStr()

  const [recipes, profile, signals, suggestions] = await Promise.all([
    getRecipes(),
    getProfile(),
    getRecommendationSignals(),
    fetchSuggestions(userId),
  ])

  const todayRow = suggestions.find((s) => s.date === today)
  if (!todayRow?.recipeId) return null
  const moveRecipeId = todayRow.recipeId

  const supabase = createClient()
  const tomorrowRow = suggestions.find((s) => s.date === tomorrow)
  if (tomorrowRow) {
    const { error } = await supabase
      .from('daily_suggestions')
      .update({
        recipe_id: moveRecipeId,
        status: 'pending',
        rejection_reason: null,
      })
      .eq('id', tomorrowRow.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('daily_suggestions').insert({
      user_id: userId,
      date: tomorrow,
      recipe_id: moveRecipeId,
      status: 'pending',
    })
    if (error) throw error
  }

  const altPool = pickRecipesMatchingSignals(recipes, new Set([moveRecipeId]), signals, profile)
  const newTodayRecipe = altPool.length
    ? altPool[Math.floor(Math.random() * altPool.length)]!
    : recipes.find((r) => r.id === moveRecipeId)
  if (!newTodayRecipe) return null

  const { data, error } = await supabase
    .from('daily_suggestions')
    .update({
      recipe_id: newTodayRecipe.id,
      status: 'pending',
      rejection_reason: null,
    })
    .eq('id', todayRow.id)
    .select('*')
    .single()
  if (error) throw error

  return { ...mapSuggestion(data as SuggestionRow), recipe: newTodayRecipe }
}

// =============================================================================
// „Etwas anderes" (Alternative-Survey + Signale)
// =============================================================================

export type ApplySomethingElseOptions = {
  cravingChoiceIds?: string[]
}

export async function applySomethingElse(
  suggestion: DailySuggestion,
  recipe: Recipe,
  reason: AlternativeSurveyReason,
  options?: ApplySomethingElseOptions,
): Promise<DailySuggestion | null> {
  const userId = await requireUserId()
  const cravingIds =
    reason === 'specific_craving' ? (options?.cravingChoiceIds?.filter(Boolean) ?? []) : []
  if (reason === 'specific_craving' && cravingIds.length === 0) return null

  const [recipes, profile, prevSignals] = await Promise.all([
    getRecipes(),
    getProfile(),
    getRecommendationSignals(),
  ])
  const nextSignals = deriveRecommendationSignalsAfterReason(prevSignals, recipe, reason, profile)

  let nextRecipe: Recipe | null = null
  if (reason === 'specific_craving') {
    nextRecipe = pickRecipeForSpecificCraving(
      recipes,
      recipe.id,
      nextSignals,
      profile,
      cravingIds,
    )
  } else {
    const pool = pickRecipesMatchingSignals(recipes, new Set([recipe.id]), nextSignals, profile)
    if (!pool.length) return null
    nextRecipe = pool[Math.floor(Math.random() * pool.length)]!
  }
  if (!nextRecipe) return null

  const supabase = createClient()
  const { error: surveyErr } = await supabase.from('alternative_surveys').insert({
    user_id: userId,
    suggestion_id: suggestion.id,
    recipe_id: recipe.id,
    reason,
    recipe_time_minutes: recipe.timeMinutes,
    recipe_ingredient_count: recipe.ingredientCount,
    recipe_pan_count: recipe.panCount,
    craving_choice_ids: cravingIds.length ? cravingIds : [],
  })
  if (surveyErr) throw surveyErr

  await saveRecommendationSignals(nextSignals)

  const { data, error } = await supabase
    .from('daily_suggestions')
    .update({
      recipe_id: nextRecipe.id,
      status: 'pending',
      rejection_reason: null,
    })
    .eq('id', suggestion.id)
    .select('*')
    .single()
  if (error) throw error

  return { ...mapSuggestion(data as SuggestionRow), recipe: nextRecipe }
}

// =============================================================================
// Feedback & History
// =============================================================================

export async function getFeedback(): Promise<Feedback[]> {
  const userId = await requireUserId()
  const supabase = createClient()
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as FeedbackRow[] | null)?.map(mapFeedback) ?? []
}

export async function saveFeedback(
  feedback: Omit<Feedback, 'id' | 'createdAt'>,
): Promise<void> {
  const userId = await requireUserId()
  const supabase = createClient()
  const { error } = await supabase.from('feedback').insert({
    user_id: userId,
    suggestion_id: feedback.suggestionId,
    recipe_id: feedback.recipeId,
    would_cook_again: feedback.wouldCookAgain,
    too_hard: feedback.tooHard,
    too_long: feedback.tooLong,
  })
  if (error) throw error
}

export async function getPastSuggestions(): Promise<DailySuggestion[]> {
  const userId = await requireUserId()
  const [suggestions, recipes] = await Promise.all([fetchSuggestions(userId), getRecipes()])
  return suggestions
    .map((s) => ({ ...s, recipe: recipes.find((r) => r.id === s.recipeId) }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

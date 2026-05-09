export type Chopping = 'none' | 'basic' | 'lots'
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'cooking' | 'completed'

export type Ingredient = {
  name: string
  amount: string
  unit?: string
}

export type Step = {
  text: string
  durationSeconds?: number
  checkText?: string
  isStopPoint?: boolean
}

export type Substitution = {
  ingredient: string
  substitute: string
}

export type Fix = {
  problem: string
  solution: string
}

export type Recipe = {
  id: string
  title: string
  description: string
  imageUrl?: string
  timeMinutes: number
  portions: number
  chopping: Chopping
  usesStove: boolean
  usesOven: boolean
  requiresMultitasking: boolean
  ingredientCount: number
  panCount: number
  canWalkAway: boolean
  tags: string[]
  ingredients: Ingredient[]
  steps: Step[]
  substitutions: Substitution[]
  fixes: Fix[]
  isActive: boolean
  createdAt: string
}

export type DailySuggestion = {
  id: string
  date: string
  recipeId: string
  recipe?: Recipe
  status: SuggestionStatus
  rejectionReason?: string
}

export type Feedback = {
  id: string
  suggestionId: string
  recipeId: string
  wouldCookAgain: boolean
  tooHard: boolean
  tooLong: boolean
  createdAt: string
}

export type Profile = {
  portions: number
  maxTimeMinutes: number
  /** Vermiedene Allergene als stabile IDs (z. B. gluten, milk, nuts) */
  allergies: string[]
  dislikes: string[]
  equipment: string[]
  notificationHour: number
}

/** Grund für „Etwas anderes“ – gleiche Werte wie in DB/Export */
export type AlternativeSurveyReason =
  | 'faster'
  | 'fewer_ingredients'
  | 'fewer_utensils'
  | 'dislike'
  | 'no_mood'
  | 'prefer_not_say'
  | 'specific_craving'

/** Aus Umfrage + Rezeptmetriken – für Auswertung & nächste Empfehlung */
export type AlternativeSurveyEntry = {
  id: string
  createdAt: string
  suggestionId: string
  recipeId: string
  reason: AlternativeSurveyReason
  recipeTimeMinutes: number
  recipeIngredientCount: number
  recipePanCount: number
  /** Nur bei reason === specific_craving – IDs aus POPULAR_CRAVING_CHOICES */
  cravingChoiceIds?: string[]
}

/**
 * Abgeleitete Grenzwerte aus wiederholten Umfragen (mit Profile.maxTimeMinutes kombinieren).
 * Spiegelt die SQL-Tabelle recommendation_signals.
 */
export type RecommendationSignals = {
  /** Zusätzliche Obergrenze Minuten (null = nur Profil) */
  timeMinutesCap: number | null
  /** Max. Zutaten-Anzahl laut Rezept-Meta */
  ingredientCountCap: number | null
  /** Max. Pfannen/Töpfe */
  panCountCap: number | null
  /** Bei „Mag ich nicht“ ausgeschlossene Rezept-IDs */
  dislikedRecipeIds: string[]
}

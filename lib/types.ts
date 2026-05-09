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
  allergies: string[]
  dislikes: string[]
  equipment: string[]
  notificationHour: number
}

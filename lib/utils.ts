import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Ingredient } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIngredientLine(ing: Ingredient): string {
  const parts = [ing.amount?.trim(), ing.unit?.trim(), ing.name?.trim()].filter(Boolean) as string[]
  return parts.join(' ')
}

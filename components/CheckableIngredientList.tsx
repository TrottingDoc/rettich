'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import {
  getShoppingListCheckedItems,
  saveShoppingListCheckedItems,
} from '@/lib/store'
import type { Ingredient } from '@/lib/types'
import { cn, formatIngredientLine } from '@/lib/utils'

function itemKey(ingredient: Ingredient, index: number): string {
  return `${index}:${formatIngredientLine(ingredient)}`
}

export default function CheckableIngredientList({
  listKey,
  ingredients,
  className,
  itemClassName,
}: {
  listKey: string
  ingredients: Ingredient[]
  className?: string
  itemClassName?: string
}) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set())
  const keys = useMemo(() => ingredients.map(itemKey), [ingredients])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const saved = await getShoppingListCheckedItems(listKey)
        if (!cancelled) {
          setChecked(new Set(saved.filter((key) => keys.includes(key))))
        }
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [keys, listKey])

  function toggle(key: string) {
    setChecked((current) => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      void saveShoppingListCheckedItems(listKey, [...next]).catch(console.error)
      return next
    })
  }

  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {ingredients.map((ing, i) => {
        const key = itemKey(ing, i)
        const isChecked = checked.has(key)
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => toggle(key)}
              className={cn(
                'flex w-full items-start gap-3 text-left text-base leading-snug transition-colors',
                itemClassName,
                isChecked ? 'text-stone-400' : 'text-stone-800',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                  isChecked
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-stone-300 bg-white text-transparent',
                )}
              >
                <Check size={15} />
              </span>
              <span className={cn('pt-0.5', isChecked && 'line-through')}>
                {formatIngredientLine(ing)}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, ShoppingCart, Volume2, VolumeX } from 'lucide-react'
import {
  createTodaySuggestion,
  getSuggestionByDate,
  todayStr,
} from '@/lib/store'
import type { DailySuggestion } from '@/lib/types'
import CheckableIngredientList, { getIngredientItemKey } from '@/components/CheckableIngredientList'
import { formatIngredientLine } from '@/lib/utils'

const UNIT_WORDS = new Set([
  'g',
  'kg',
  'ml',
  'l',
  'tl',
  'el',
  'prise',
  'prisen',
  'stueck',
  'stuck',
  'dose',
  'dosen',
  'packung',
  'packungen',
  'scheibe',
  'scheiben',
  'handvoll',
  'tasse',
  'tassen',
  'becher',
  'glas',
  'glaeser',
  'bund',
])

function normalizeIngredientNameForAlexa(name: string): string {
  return name
    .replace(/\([^)]*\)/g, '')
    .replace(/\boptional\b/gi, '')
    .trim()
}

function getAlexaIngredientName(line: string): string {
  return normalizeIngredientNameForAlexa(
    line
      .split(/\s+/)
      .filter((part) => {
        const normalized = part
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{M}/gu, '')
          .replace(/[.,]/g, '')

        if (/^\d/.test(normalized)) return false
        if (UNIT_WORDS.has(normalized)) return false
        return true
      })
      .join(' '),
  )
}

function getGermanVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((voice) => voice.lang === 'de-DE') ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('de')) ??
    voices.find((voice) => voice.name.toLowerCase().includes('german')) ??
    voices.find((voice) => voice.name.toLowerCase().includes('deutsch'))
  )
}

export default function EinkaufenPage() {
  const [todaySuggestion, setTodaySuggestion] = useState<DailySuggestion | null>(null)
  const [checkedIngredientKeys, setCheckedIngredientKeys] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  /** Same as `isSpeaking`, but updated synchronously so „Stop“ works before the next paint (mobile). */
  const isSpeakingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        await createTodaySuggestion()
        const today = await getSuggestionByDate(todayStr())
        if (!cancelled) {
          setTodaySuggestion(today)
        }
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null
        window.speechSynthesis.cancel()
      }
      isSpeakingRef.current = false
    }
  }, [])

  const todayRecipe = todaySuggestion?.recipe

  async function copyShoppingList() {
    if (!todayRecipe) return
    const checked = new Set(checkedIngredientKeys)
    const lines = todayRecipe.ingredients
      .filter((ingredient, index) => !checked.has(getIngredientItemKey(ingredient, index)))
      .map(formatIngredientLine)
    const text = `${todayRecipe.title}\n\n${
      lines.length ? lines.map((line) => `• ${line}`).join('\n') : 'Nichts einzukaufen.'
    }`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch (err) {
      console.error(err)
    }
  }

  function getUncheckedIngredientLines(): string[] {
    if (!todayRecipe) return []
    const checked = new Set(checkedIngredientKeys)
    return todayRecipe.ingredients
      .filter((ingredient, index) => !checked.has(getIngredientItemKey(ingredient, index)))
      .map(formatIngredientLine)
  }

  function readForAlexa() {
    if (!todayRecipe || typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const synth = window.speechSynthesis

    if (isSpeakingRef.current) {
      synth.onvoiceschanged = null
      synth.cancel()
      isSpeakingRef.current = false
      setIsSpeaking(false)
      return
    }

    const ingredientNames = getUncheckedIngredientLines()
      .map(getAlexaIngredientName)
      .filter(Boolean)
    const phrases =
      ingredientNames.length > 0
        ? ingredientNames.map((name) => `Alexa, setz ${name} auf die Einkaufsliste.`)
        : ['Es ist nichts einzukaufen.']

    function speakPhrases() {
      // `voiceschanged` fires repeatedly on some browsers; leaving the handler set re-queued all phrases from the start.
      synth.onvoiceschanged = null
      synth.cancel()
      isSpeakingRef.current = true
      setIsSpeaking(true)
      const germanVoice = getGermanVoice()
      const lastIndex = phrases.length - 1

      phrases.forEach((phrase, index) => {
        const utterance = new SpeechSynthesisUtterance(phrase)
        utterance.lang = germanVoice?.lang ?? 'de-DE'
        if (germanVoice) utterance.voice = germanVoice
        utterance.rate = 1.32
        utterance.onend = () => {
          if (index === lastIndex) {
            isSpeakingRef.current = false
            setIsSpeaking(false)
          }
        }
        utterance.onerror = () => {
          isSpeakingRef.current = false
          setIsSpeaking(false)
        }
        synth.speak(utterance)
      })
    }

    if (synth.getVoices().length) {
      speakPhrases()
      return
    }

    synth.onvoiceschanged = () => {
      synth.onvoiceschanged = null
      speakPhrases()
    }
  }

  return (
    <div className="px-4 pt-8 pb-6 flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <ShoppingCart
          size={28}
          className="text-orange-600 shrink-0 mt-1"
          aria-hidden
        />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-stone-900">Einkaufen</h1>
          <p className="text-stone-500 mt-1">
            Zutatenlisten für dein Tagesgericht – zum Abhaken beim Einkauf.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-stone-800 leading-snug">Für heute</h2>
        {!todayRecipe && (
          <p className="text-sm text-stone-500">
            Noch kein Vorschlag für heute – kurz auf „Rett:mich“ gehen, dann hier aktualisieren.
          </p>
        )}
        {todayRecipe && (
          <>
            <p className="text-sm font-medium text-stone-700">{todayRecipe.title}</p>
            <CheckableIngredientList
              listKey={`shopping:${todayStr()}:${todayRecipe.id}`}
              ingredients={todayRecipe.ingredients}
              className="border-t border-stone-100 pt-4"
              onCheckedChange={setCheckedIngredientKeys}
            />
          </>
        )}
        <button
          type="button"
          onClick={() => void copyShoppingList()}
          disabled={!todayRecipe}
          className="flex items-center justify-center gap-3 w-full rounded-xl bg-orange-600 px-4 py-3.5 text-left text-white transition-all hover:bg-orange-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
        >
          <ClipboardList size={17} className="shrink-0" />
          <span className="flex flex-col leading-snug">
            <span className="text-base font-semibold">
              {copied ? 'Kopiert!' : 'In meine Zwischenablage kopieren'}
            </span>
            {!copied && (
              <span className="text-xs font-medium text-white/85">
                Wähle Zutaten ab, die du bereits da hast.
              </span>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={readForAlexa}
          disabled={!todayRecipe}
          className="flex items-center justify-center gap-3 w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-left text-stone-700 transition-all hover:bg-stone-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
        >
          {isSpeaking ? (
            <VolumeX size={17} className="shrink-0 text-orange-600" />
          ) : (
            <Volume2 size={17} className="shrink-0 text-orange-600" />
          )}
          <span className="flex flex-col leading-snug">
            <span className="text-base font-semibold">
              {isSpeaking ? 'Vorlesen stoppen' : 'Für Alexa vorlesen'}
            </span>
            <span className="text-xs font-medium text-stone-500">
              {isSpeaking
                ? 'Bricht die aktuelle Ausgabe ab.'
                : 'Pro Zutat ein eigener Alexa-Satz, ohne Mengenangaben.'}
            </span>
          </span>
        </button>
        {todayRecipe && (
          <Link
            href={`/kochen/${todayRecipe.id}`}
            className="text-center text-sm font-medium text-orange-700 hover:text-orange-800"
          >
            Lass uns Kochen!
          </Link>
        )}
      </div>

    </div>
  )
}

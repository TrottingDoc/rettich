'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save } from 'lucide-react'
import { saveRecipe } from '@/lib/store'
import type { Recipe, Ingredient, Step, Substitution, Fix, Chopping } from '@/lib/types'
import { cn } from '@/lib/utils'

const TAGS = [
  'vegetarisch',
  'vegan',
  'schnell',
  'kein-herd',
  'weiche-speisen',
  'frühstück',
  'ei',
  'pasta',
  'tomate',
  'käse',
  'brot',
  'butter',
  'hafer',
  'milch',
  'reis',
  'kartoffel',
  'hähnchen',
  'fisch',
  'salat',
  'dressing',
  'auflauf',
  'ofengericht',
  'curry',
  'sauce',
  'party',
  'low-salt',
]

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-stone-700 mb-1.5">{children}</label>
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full border border-stone-300 rounded-lg px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition',
        className,
      )}
    />
  )
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
    />
  )
}

const EMPTY_RECIPE: Omit<Recipe, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  imageUrl: '',
  timeMinutes: 15,
  portions: 1,
  chopping: 'none',
  usesStove: false,
  usesOven: false,
  requiresMultitasking: false,
  ingredientCount: 0,
  panCount: 1,
  canWalkAway: false,
  tags: [],
  ingredients: [{ name: '', amount: '', unit: '' }],
  steps: [{ text: '', ingredients: [], durationSeconds: undefined, checkText: '', isStopPoint: false }],
  substitutions: [],
  fixes: [],
  isActive: true,
}

export default function RezeptFormular({ recipe }: { recipe?: Recipe }) {
  const router = useRouter()
  const [form, setForm] = useState<Omit<Recipe, 'id' | 'createdAt'>>(
    recipe ?? EMPTY_RECIPE,
  )
  const [saving, setSaving] = useState(false)

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addIngredient() {
    update('ingredients', [...form.ingredients, { name: '', amount: '', unit: '' }])
  }

  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    const updated = form.ingredients.map((ing, idx) =>
      idx === i ? { ...ing, [field]: value } : ing,
    )
    update('ingredients', updated)
    update('ingredientCount', updated.length)
  }

  function removeIngredient(i: number) {
    const updated = form.ingredients.filter((_, idx) => idx !== i)
    update('ingredients', updated)
    update('ingredientCount', updated.length)
  }

  function addStep() {
    update('steps', [
      ...form.steps,
      { text: '', ingredients: [], durationSeconds: undefined, checkText: '', isStopPoint: false },
    ])
  }

  function updateStep(
    i: number,
    field: keyof Step,
    value: string | number | boolean | Ingredient[] | undefined,
  ) {
    update(
      'steps',
      form.steps.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    )
  }

  function addStepIngredient(stepIndex: number) {
    const step = form.steps[stepIndex]
    updateStep(stepIndex, 'ingredients', [
      ...(step.ingredients ?? []),
      { name: '', amount: '', unit: '' },
    ])
  }

  function updateStepIngredient(
    stepIndex: number,
    ingredientIndex: number,
    field: keyof Ingredient,
    value: string,
  ) {
    const step = form.steps[stepIndex]
    const updated = (step.ingredients ?? []).map((ing, idx) =>
      idx === ingredientIndex ? { ...ing, [field]: value } : ing,
    )
    updateStep(stepIndex, 'ingredients', updated)
  }

  function removeStepIngredient(stepIndex: number, ingredientIndex: number) {
    const step = form.steps[stepIndex]
    updateStep(
      stepIndex,
      'ingredients',
      (step.ingredients ?? []).filter((_, idx) => idx !== ingredientIndex),
    )
  }

  function removeStep(i: number) {
    update('steps', form.steps.filter((_, idx) => idx !== i))
  }

  function addSubstitution() {
    update('substitutions', [...form.substitutions, { ingredient: '', substitute: '' }])
  }

  function updateSubstitution(i: number, field: keyof Substitution, value: string) {
    update(
      'substitutions',
      form.substitutions.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    )
  }

  function addFix() {
    update('fixes', [...form.fixes, { problem: '', solution: '' }])
  }

  function updateFix(i: number, field: keyof Fix, value: string) {
    update(
      'fixes',
      form.fixes.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)),
    )
  }

  function toggleTag(tag: string) {
    const has = form.tags.includes(tag)
    update('tags', has ? form.tags.filter((t) => t !== tag) : [...form.tags, tag])
  }

  async function submit() {
    if (!form.title.trim()) return
    setSaving(true)
    const saved: Recipe = {
      ...form,
      id: recipe?.id ?? '',
      createdAt: recipe?.createdAt ?? new Date().toISOString(),
      imageUrl: form.imageUrl?.trim() || undefined,
      ingredientCount: form.ingredients.filter((i) => i.name).length,
    }
    try {
      await saveRecipe(saved)
      router.push('/admin')
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); void submit() }}
      className="flex flex-col gap-8"
    >
      {/* Basics */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-stone-900">Grundangaben</h2>

        <div>
          <FieldLabel>Titel *</FieldLabel>
          <Input value={form.title} onChange={(v) => update('title', v)} placeholder="z. B. Rührei mit Toast" />
        </div>

        <div>
          <FieldLabel>Beschreibung</FieldLabel>
          <Textarea
            value={form.description ?? ''}
            onChange={(v) => update('description', v)}
            placeholder="Ein kurzer Satz, der Lust aufs Kochen macht."
          />
        </div>

        <div>
          <FieldLabel>Bild-URL</FieldLabel>
          <Input
            type="url"
            value={form.imageUrl ?? ''}
            onChange={(v) => update('imageUrl', v)}
            placeholder="https://deine-domain.de/rettich/rezepte/ruehrei.webp"
          />
          <p className="text-xs text-stone-500 mt-1.5">
            Öffentlich erreichbarer Link zu einem Bild, z. B. aus deinem all-inkl-Webspace.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Zeit (Minuten)</FieldLabel>
            <Input type="number" value={form.timeMinutes} onChange={(v) => update('timeMinutes', Number(v))} />
          </div>
          <div>
            <FieldLabel>Portionen</FieldLabel>
            <Input type="number" value={form.portions} onChange={(v) => update('portions', Number(v))} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update('isActive', e.target.checked)}
            className="w-4 h-4 accent-orange-600"
          />
          <label htmlFor="isActive" className="text-sm text-stone-700">Aktiv (wird als Vorschlag angezeigt)</label>
        </div>
      </section>

      {/* Complexity */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-stone-900">Schwierigkeitsgrad</h2>

        <div>
          <FieldLabel>Schneiden</FieldLabel>
          <div className="flex gap-2">
            {(['none', 'basic', 'lots'] as Chopping[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update('chopping', c)}
                className={cn(
                  'flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all',
                  form.chopping === c
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'border-stone-300 text-stone-600 hover:border-orange-400',
                )}
              >
                {c === 'none' ? 'Kein' : c === 'basic' ? 'Wenig' : 'Viel'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'usesStove', label: '🔥 Herd' },
            { key: 'usesOven', label: '🫙 Backofen' },
            { key: 'requiresMultitasking', label: '🤹 Multitasking' },
            { key: 'canWalkAway', label: '🚶 Kann weggehen' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form[key as keyof typeof form] as boolean}
                onChange={(e) => update(key as keyof typeof form, e.target.checked as never)}
                className="w-4 h-4 accent-orange-600"
              />
              {label}
            </label>
          ))}
        </div>

        <div>
          <FieldLabel>Anzahl Pfannen / Töpfe</FieldLabel>
          <Input type="number" value={form.panCount} onChange={(v) => update('panCount', Number(v))} />
        </div>
      </section>

      {/* Tags */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-stone-900">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                'px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
                form.tags.includes(tag)
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'border-stone-300 text-stone-600 hover:border-orange-400',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Ingredients */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-stone-900">Zutaten</h2>
        <div className="flex flex-col gap-2">
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Input value={ing.amount} onChange={(v) => updateIngredient(i, 'amount', v)} placeholder="Menge" className="w-20 shrink-0" />
              <Input value={ing.unit ?? ''} onChange={(v) => updateIngredient(i, 'unit', v)} placeholder="Einheit" className="w-24 shrink-0" />
              <Input value={ing.name} onChange={(v) => updateIngredient(i, 'name', v)} placeholder="Zutat" className="flex-1" />
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="p-2.5 text-stone-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          <Plus size={16} /> Zutat hinzufügen
        </button>
      </section>

      {/* Steps */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-stone-900">Schritte</h2>
        <div className="flex flex-col gap-4">
          {form.steps.map((step, i) => (
            <div key={i} className="border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <Textarea
                value={step.text}
                onChange={(v) => updateStep(i, 'text', v)}
                placeholder="Beschreibe diesen Schritt klar und einfach…"
                rows={2}
              />
              <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3 flex flex-col gap-2">
                <div>
                  <FieldLabel>Zutaten für diesen Schritt</FieldLabel>
                  <p className="text-xs text-stone-500 -mt-1 mb-2">
                    Nur die Zutaten und Mengen, die in diesem Schritt wirklich gebraucht werden.
                  </p>
                </div>
                {(step.ingredients ?? []).map((ing, ingredientIndex) => (
                  <div key={ingredientIndex} className="flex gap-2 items-start">
                    <Input
                      value={ing.amount}
                      onChange={(v) => updateStepIngredient(i, ingredientIndex, 'amount', v)}
                      placeholder="Menge"
                      className="w-20 shrink-0 bg-white"
                    />
                    <Input
                      value={ing.unit ?? ''}
                      onChange={(v) => updateStepIngredient(i, ingredientIndex, 'unit', v)}
                      placeholder="Einheit"
                      className="w-24 shrink-0 bg-white"
                    />
                    <Input
                      value={ing.name}
                      onChange={(v) => updateStepIngredient(i, ingredientIndex, 'name', v)}
                      placeholder="Zutat"
                      className="flex-1 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeStepIngredient(i, ingredientIndex)}
                      className="p-2.5 text-stone-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addStepIngredient(i)}
                  className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <Plus size={16} /> Schritt-Zutat hinzufügen
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Timer (Sekunden, optional)</FieldLabel>
                  <Input
                    type="number"
                    value={step.durationSeconds ?? ''}
                    onChange={(v) => updateStep(i, 'durationSeconds', v ? Number(v) : undefined)}
                    placeholder="z. B. 300"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel>Stoppunkt?</FieldLabel>
                  <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={step.isStopPoint ?? false}
                      onChange={(e) => updateStep(i, 'isStopPoint', e.target.checked)}
                      className="w-4 h-4 accent-orange-600"
                    />
                    Guter Pause-Moment
                  </label>
                </div>
              </div>
              <div>
                <FieldLabel>Kontrolle (optional)</FieldLabel>
                <Input
                  value={step.checkText ?? ''}
                  onChange={(v) => updateStep(i, 'checkText', v)}
                  placeholder="z. B. Die Butter soll nicht bräunen."
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          <Plus size={16} /> Schritt hinzufügen
        </button>
      </section>

      {/* Substitutions */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-stone-900">Zutaten-Ersatz</h2>
        <div className="flex flex-col gap-2">
          {form.substitutions.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Input value={s.ingredient} onChange={(v) => updateSubstitution(i, 'ingredient', v)} placeholder="Zutat" />
              <span className="self-center text-stone-400">→</span>
              <Input value={s.substitute} onChange={(v) => updateSubstitution(i, 'substitute', v)} placeholder="Alternative" />
              <button
                type="button"
                onClick={() => update('substitutions', form.substitutions.filter((_, idx) => idx !== i))}
                className="p-2.5 text-stone-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSubstitution}
          className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          <Plus size={16} /> Ersatz hinzufügen
        </button>
      </section>

      {/* Fixes */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-stone-900">Pannenhilfe</h2>
        <div className="flex flex-col gap-3">
          {form.fixes.map((f, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 flex flex-col gap-1">
                <Input value={f.problem} onChange={(v) => updateFix(i, 'problem', v)} placeholder="Problem (z. B. Zu salzig?)" />
                <Input value={f.solution} onChange={(v) => updateFix(i, 'solution', v)} placeholder="Lösung" />
              </div>
              <button
                type="button"
                onClick={() => update('fixes', form.fixes.filter((_, idx) => idx !== i))}
                className="p-2.5 text-stone-400 hover:text-red-500 transition-colors shrink-0 mt-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFix}
          className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          <Plus size={16} /> Pannenhilfe hinzufügen
        </button>
      </section>

      {/* Submit */}
      <div className="flex gap-3 pb-4">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="flex-1 border border-stone-300 text-stone-700 font-semibold py-3.5 rounded-xl hover:bg-stone-50 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={!form.title.trim() || saving}
          className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white font-semibold py-3.5 rounded-xl hover:bg-orange-700 disabled:opacity-40 transition-all active:scale-95"
        >
          <Save size={18} />
          {recipe ? 'Speichern' : 'Erstellen'}
        </button>
      </div>
    </form>
  )
}

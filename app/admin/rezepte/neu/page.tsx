import RezeptFormular from '@/components/RezeptFormular'

export default function NeuesRezeptPage() {
  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Neues Rezept</h1>
        <p className="text-stone-500 mt-1">Füll die Felder aus und speichere das Rezept.</p>
      </div>
      <RezeptFormular />
    </div>
  )
}

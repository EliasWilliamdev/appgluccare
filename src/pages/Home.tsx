import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabaseClient'

type Reading = {
  id: string
  value: number
  recorded_at: string
  notes: string | null
}

export default function Home() {
  const { user } = useAuth()
  const [items, setItems] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const [formValue, setFormValue] = useState<string>('')
  const [formDate, setFormDate] = useState<string>(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`)
  const [formTime, setFormTime] = useState<string>(`${pad(now.getHours())}:${pad(now.getMinutes())}`)
  const [formNotes, setFormNotes] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const dfDate = useMemo(() => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }), [])
  const dfTime = useMemo(() => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }), [])

  async function fetchReadingsOnce(activeRef: { current: boolean }) {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('glucose_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
      if (!activeRef.current) return
      if (error) {
        setError('Falha ao carregar aferições.')
        setItems([])
      } else {
        setItems((data ?? []) as Reading[])
      }
    } catch {
      if (!activeRef.current) return
      setError('Falha ao carregar aferições.')
      setItems([])
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const activeRef = { current: active }
    fetchReadingsOnce(activeRef)
    return () => { active = false }
  }, [user?.id])

  async function saveReading() {
    setSaveError(null)
    setSaving(true)
    try {
      const value = Number(formValue)
      if (!value || value <= 0) {
        setSaveError('Informe um valor válido (mg/dL).')
        return
      }
      const recordedAtLocal = new Date(`${formDate}T${formTime}:00`)
      const recorded_at = recordedAtLocal.toISOString()
      const notes = formNotes || null
      const payload: any = { value, recorded_at, notes }
      if (user?.id) payload.user_id = user.id
      const { error } = await supabase
        .from('glucose_readings')
        .insert([payload])
      if (error) {
        setSaveError('Falha ao salvar a aferição. Tente novamente.')
        return
      }
      setShowModal(false)
      const activeRef = { current: true }
      await fetchReadingsOnce(activeRef)
      setFormValue('')
      setFormNotes('')
      const now2 = new Date()
      setFormDate(`${now2.getFullYear()}-${pad(now2.getMonth() + 1)}-${pad(now2.getDate())}`)
      setFormTime(`${pad(now2.getHours())}:${pad(now2.getMinutes())}`)
    } catch {
      setSaveError('Falha ao salvar a aferição. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 dark:bg-neutral-900/50 backdrop-blur-xl text-white p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold mb-4">Histórico de Aferições</h1>

        {error && <div className="mb-3 rounded-xl border border-red-300/40 bg-red-500/10 text-red-200 px-3 py-2" role="alert" aria-live="polite">{error}</div>}

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 animate-pulse" key={i}>
                <div className="h-5 w-24 bg-white/10 rounded" />
                <div className="h-4 w-40 bg-white/10 rounded mt-2" />
                <div className="h-4 w-64 bg-white/10 rounded mt-2" />
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="mb-3 rounded-xl border border-emerald-300/40 bg-emerald-500/10 text-emerald-200 px-3 py-2" role="status" aria-live="polite">Nenhuma medição registrada. Toque no botão + para adicionar sua primeira!</div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((it) => {
              const d = new Date(it.recorded_at)
              const dateStr = dfDate.format(d)
              const timeStr = dfTime.format(d)
              return (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition shadow hover:shadow-2xl hover:scale-[1.01]" key={it.id}>
                  <div className="font-semibold text-white">{it.value} mg/dL</div>
                  <div className="text-xs text-white/70 mt-1">{dateStr} • {timeStr}</div>
                  {it.notes && <div className="text-sm text-white/80 mt-2">{it.notes}</div>}
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:scale-105 active:scale-95 transition" onClick={() => supabase.auth.signOut()}>Sair</button>
        </div>
      </div>

      <button className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-brand-700 text-white text-2xl shadow-lg shadow-brand-700/30 hover:scale-110 active:scale-95 transition" aria-label="Adicionar aferição" onClick={() => setShowModal(true)}>
        +
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 backdrop-blur-xl bg-black/40" role="dialog" aria-modal="true">
          <div className="max-w-xl w-full rounded-2xl border border-white/20 bg-white/10 dark:bg-neutral-900/50 shadow-2xl p-6 text-white">
            <h2 className="text-xl font-semibold mb-3">Nova Aferição</h2>

            <label className="text-xs mb-1 block" htmlFor="value">Valor (mg/dL)</label>
            <input id="value" className="w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white px-3 py-3 outline-none transition focus:border-brand-700" type="number" inputMode="numeric" step="1" min="1" value={formValue} onChange={(e) => setFormValue(e.target.value)} />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs mb-1 block" htmlFor="date">Data</label>
                <input id="date" className="w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white px-3 py-3 outline-none transition focus:border-brand-700" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs mb-1 block" htmlFor="time">Hora</label>
                <input id="time" className="w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white px-3 py-3 outline-none transition focus:border-brand-700" type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
              </div>
            </div>

            <label className="text-xs mb-1 block mt-3" htmlFor="notes">Notas (opcional)</label>
            <textarea id="notes" className="w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white px-3 py-3 outline-none transition focus:border-brand-700" rows={4} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />

            {saveError && <div className="mt-3 rounded-xl border border-red-300/40 bg-red-500/10 text-red-200 px-3 py-2" role="alert" aria-live="polite">{saveError}</div>}

            <div className="mt-4 flex gap-3 justify-end">
              <button className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:scale-105 active:scale-95 transition" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-700 text-white hover:scale-[1.02] active:scale-95 transition duration-200 shadow-lg shadow-brand-700/30 disabled:opacity-50" disabled={saving || !formValue || Number(formValue) <= 0} onClick={saveReading}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
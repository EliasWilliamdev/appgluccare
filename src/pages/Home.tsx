import { useEffect, useMemo, useState, useRef } from 'react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/ui/card'
import { Dialog } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import { Activity, CalendarDays, Clock, Plus } from 'lucide-react'
// gráfico inline com SVG para evitar dependências externas

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
  const [hoveredPoint, setHoveredPoint] = useState<{index: number; x: number; y: number; value: number; label: string} | null>(null)
  const chartRef = useRef<SVGSVGElement>(null)

  const dfDate = useMemo(() => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }), [])
  const dfTime = useMemo(() => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }), [])
  const dfAxis = useMemo(() => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }), [])
  const sorted = useMemo(() => items.slice().sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()), [items])
  const chartLabels = useMemo(() => sorted.map(it => dfAxis.format(new Date(it.recorded_at))), [sorted, dfAxis])
  const chartValues = useMemo(() => sorted.map(it => it.value), [sorted])
  const chartGeom = useMemo(() => {
    const W = 600
    const H = 200
    const padX = 24
    const padY = 16
    const n = chartValues.length
    if (n === 0) return { W, H, padX, padY, points: [], min: 0, max: 0 }
    const min = Math.min(...chartValues)
    const max = Math.max(...chartValues)
    const span = max - min || 1
    const innerW = W - padX * 2
    const innerH = H - padY * 2
    const points = chartValues.map((v, i) => {
      const x = padX + (n === 1 ? innerW / 2 : (i * innerW) / (n - 1))
      const y = padY + innerH * (1 - (v - min) / span)
      return { x, y }
    })
    const ref180 = padY + innerH * (1 - (180 - min) / span)
    return { W, H, padX, padY, points, min, max, span, ref180 }
  }, [chartValues])

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
        toast.error('Falha ao carregar aferições')
        setItems([])
      } else {
        setItems((data ?? []) as Reading[])
      }
    } catch {
      if (!activeRef.current) return
      setError('Falha ao carregar aferições.')
      toast.error('Falha ao carregar aferições')
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function saveReading() {
    setSaveError(null)
    setSaving(true)
    try {
      const value = Number(formValue)
      if (!value || value <= 0) {
        setSaveError('Informe um valor válido (mg/dL).')
        toast.error('Informe um valor válido (mg/dL)')
        return
      }
      const recordedAtLocal = new Date(`${formDate}T${formTime}:00`)
      const recorded_at = recordedAtLocal.toISOString()
      const notes = formNotes || null
      const payload: Record<string, unknown> = { value, recorded_at, notes }
      if (user?.id) payload.user_id = user.id
      const { error } = await supabase
        .from('glucose_readings')
        .insert([payload])
      if (error) {
        setSaveError('Falha ao salvar a aferição. Tente novamente.')
        toast.error('Falha ao salvar a aferição')
        return
      }
      setShowModal(false)
      toast.success('Aferição salva com sucesso')
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
      <div className="w-full max-w-2xl">
        <Card>
          <h1 className="text-2xl font-semibold mb-4">Histórico de Aferições</h1>

          {!loading && items.length > 0 && chartGeom.points.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4 relative">
              <div className="text-sm text-white/80 mb-2">Picos de glicemia</div>
              <div style={{ width: '100%', height: 240 }} className="relative">
                <svg 
                  ref={chartRef}
                  viewBox={`0 0 ${chartGeom.W} ${chartGeom.H}`} 
                  width="100%" 
                  height="100%" 
                  preserveAspectRatio="none"
                  className="cursor-pointer"
                >
                  <rect x={chartGeom.padX} y={chartGeom.padY} width={chartGeom.W - chartGeom.padX * 2} height={chartGeom.H - chartGeom.padY * 2} fill="none" stroke="rgba(255,255,255,0.15)" />
                  {[0.25, 0.5, 0.75].map((t, i) => (
                    <line key={i} x1={chartGeom.padX} x2={chartGeom.W - chartGeom.padX} y1={chartGeom.padY + (chartGeom.H - chartGeom.padY * 2) * t} y2={chartGeom.padY + (chartGeom.H - chartGeom.padY * 2) * t} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                  ))}
                  {chartGeom.ref180 && chartGeom.ref180 >= chartGeom.padY && chartGeom.ref180 <= chartGeom.H - chartGeom.padY && (
                    <line x1={chartGeom.padX} x2={chartGeom.W - chartGeom.padX} y1={chartGeom.ref180} y2={chartGeom.ref180} stroke="#ef4444" strokeDasharray="4 4" />
                  )}
                  {(() => {
                    const d = chartGeom.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                    return <path d={d} fill="none" stroke="#22c55e" strokeWidth={2} />
                  })()}
                  {chartGeom.points.map((p, i) => (
                    <circle 
                      key={i} 
                      cx={p.x} 
                      cy={p.y} 
                      r={hoveredPoint?.index === i ? 5 : 3} 
                      fill="#22c55e" 
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredPoint({
                        index: i,
                        x: p.x,
                        y: p.y,
                        value: chartValues[i],
                        label: chartLabels[i]
                      })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                  {hoveredPoint && (
                    <line 
                      x1={hoveredPoint.x} 
                      x2={hoveredPoint.x} 
                      y1={chartGeom.padY} 
                      y2={chartGeom.H - chartGeom.padY} 
                      stroke="rgba(255,255,255,0.3)" 
                      strokeDasharray="2 2" 
                      className="transition-opacity duration-200"
                    />
                  )}
                  {chartGeom.points.map((p, i) => (
                    <text key={`lbl-${i}`} x={p.x} y={chartGeom.H - 2} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.7)">{chartLabels[i]}</text>
                  ))}
                </svg>
                {hoveredPoint && (
                  <div 
                    className="absolute bg-neutral-900/95 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-10 transition-all duration-200 shadow-lg border border-white/20 backdrop-blur-sm"
                    style={{
                      left: `${Math.min(Math.max((hoveredPoint.x / chartGeom.W) * 100, 15), 85)}%`,
                      top: `${Math.max((hoveredPoint.y / chartGeom.H) * 100 - 10, 5)}%`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div className="font-semibold text-green-400">{hoveredPoint.value} mg/dL</div>
                    <div className="text-white/80 text-xs">{hoveredPoint.label}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-neutral-900/95"></div>
                  </div>
                )}
              </div>
            </div>
          )}

        {error && <div className="mb-3 rounded-xl border border-red-300/40 bg-red-500/10 text-red-700 dark:text-red-200 px-3 py-2" role="alert" aria-live="polite">{error}</div>}

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
          <div className="mb-3 rounded-xl border border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 px-3 py-2" role="status" aria-live="polite">Nenhuma medição registrada. Toque no botão + para adicionar sua primeira!</div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((it) => {
              const d = new Date(it.recorded_at)
              const dateStr = dfDate.format(d)
              const timeStr = dfTime.format(d)
              return (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition shadow hover:shadow-2xl hover:scale-[1.01]" key={it.id}>
                  <div className="font-semibold text-white flex items-center gap-2"><Activity size={16} /> {it.value} mg/dL</div>
                  <div className="text-xs text-white/70 mt-1 flex items-center gap-2"><CalendarDays size={14} /> {dateStr} <span>•</span> <Clock size={14} /> {timeStr}</div>
                  {it.notes && <div className="text-sm text-white/80 mt-2">{it.notes}</div>}
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:scale-105 active:scale-95 transition" onClick={() => supabase.auth.signOut()}>Sair</button>
        </div>
        </Card>
      </div>

      <Button className="fixed right-6 bottom-6 w-14 h-14 rounded-full" aria-label="Adicionar aferição" onClick={() => setShowModal(true)}>
        <Plus />
      </Button>

      {showModal && (
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
          <h2 className="text-xl font-semibold mb-3">Nova Aferição</h2>

          <Label htmlFor="value">Valor (mg/dL)</Label>
          <Input id="value" type="number" inputMode="numeric" step="1" min="1" value={formValue} onChange={(e) => setFormValue(e.target.value)} />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="time">Hora</Label>
              <Input id="time" type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
            </div>
          </div>

          <Label className="mt-3" htmlFor="notes">Notas (opcional)</Label>
          <textarea id="notes" className="w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white px-3 py-3 outline-none transition focus:border-brand-700" rows={4} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />

          {saveError && <div className="mt-3 rounded-xl border border-red-300/40 bg-red-500/10 text-red-700 dark:text-red-200 px-3 py-2" role="alert" aria-live="polite">{saveError}</div>}

          <div className="mt-4 flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={saveReading} disabled={saving || !formValue || Number(formValue) <= 0}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

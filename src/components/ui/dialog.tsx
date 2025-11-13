import type { ReactNode } from 'react'

export function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 backdrop-blur-xl bg-black/40" role="dialog" aria-modal="true">
      <div className="max-w-xl w-full rounded-2xl border border-white/20 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 shadow-2xl p-6 text-white transition-colors duration-300">
        {children}
        <button className="sr-only" aria-label="Fechar" onClick={onClose} />
      </div>
    </div>
  )
}


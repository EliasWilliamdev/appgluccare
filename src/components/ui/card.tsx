import type { ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={clsx('rounded-2xl border border-white/20 bg-white/10 dark:bg-neutral-800/50 backdrop-blur-xl text-white p-6 shadow-2xl transition-colors duration-300', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-2xl font-semibold mb-4">{children}</h1>
}


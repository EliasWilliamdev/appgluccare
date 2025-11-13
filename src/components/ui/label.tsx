import type { LabelHTMLAttributes } from 'react'
import clsx from 'clsx'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, ...props }: LabelProps) {
  return <label className={clsx('text-xs mb-1 block text-white/80', className)} {...props} />
}


import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={clsx('w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white px-3 py-3 outline-none transition focus:border-brand-700 placeholder:text-white/60', className)}
      {...props}
    />
  )
})


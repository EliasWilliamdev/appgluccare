import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, disabled, children, ...props },
  ref
) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl transition duration-200 disabled:opacity-50 active:scale-95'
  const variants = {
    primary: 'bg-brand-700 text-white shadow-lg shadow-brand-700/30 hover:scale-[1.02] focus:outline-none',
    outline: 'border border-white/20 dark:border-neutral-600 bg-white/10 dark:bg-neutral-800/30 text-white hover:scale-[1.02] focus:outline-none',
    ghost: 'text-white hover:bg-white/10 dark:hover:bg-neutral-700/30 focus:outline-none'
  }
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-5 py-3 text-lg'
  }
  return (
    <button
      ref={ref}
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  )
})


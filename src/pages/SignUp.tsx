import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase, supabaseConfigOk } from '../lib/supabaseClient'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string().min(8, 'Confirmar Senha é obrigatório')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword']
})

type FormValues = z.infer<typeof schema>

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiSuccess, setApiSuccess] = useState<string | null>(null)

  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })

  const onSubmit = async (values: FormValues) => {
    setApiError(null)
    setApiSuccess(null)
    if (!supabaseConfigOk) {
      setApiError('Configuração do Supabase ausente. Verifique as variáveis de ambiente.')
      return
    }
    const { email, password, name } = values
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin
      }
    })
    if (error) {
      setApiError(error.message)
      return
    }
    if (!data?.user) {
      setApiError('Não foi possível criar o usuário no Supabase.')
      return
    }
    setApiSuccess('Cadastro realizado. Verifique seu e-mail para confirmar.')
    reset({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 dark:bg-neutral-900/50 backdrop-blur-xl text-neutral-800 dark:text-neutral-100 p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold mb-4 text-white">Cadastrar</h1>

        {!!apiError && (
          <div className="mb-3 rounded-xl border border-red-300/40 bg-red-500/10 text-red-200 px-3 py-2" role="alert" aria-live="polite">{apiError}</div>
        )}
        {!!apiSuccess && (
          <div className="mb-3 rounded-xl border border-emerald-300/40 bg-emerald-500/10 text-emerald-200 px-3 py-2" role="status" aria-live="polite">{apiSuccess}</div>
        )}

        <div className="relative mb-4">
          <input id="name" type="text" placeholder=" " className="peer w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white placeholder-transparent px-3 py-3 outline-none transition focus:border-brand-700" aria-invalid={!!formState.errors.name} {...register('name')} />
          <label htmlFor="name" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs">Nome</label>
          {formState.errors.name && (<div className="text-red-300 text-xs mt-2">{formState.errors.name.message}</div>)}
        </div>

        <div className="relative mb-4">
          <input id="email" type="email" placeholder=" " className="peer w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white placeholder-transparent px-3 py-3 outline-none transition focus:border-brand-700" aria-invalid={!!formState.errors.email} {...register('email')} />
          <label htmlFor="email" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs">E-mail</label>
          {formState.errors.email && (<div className="text-red-300 text-xs mt-2">{formState.errors.email.message}</div>)}
        </div>

        <div className="relative mb-4">
          <input id="password" type={showPassword ? 'text' : 'password'} placeholder=" " className="peer w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white placeholder-transparent px-3 py-3 outline-none transition focus:border-brand-700" aria-invalid={!!formState.errors.password} {...register('password')} />
          <label htmlFor="password" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs">Senha</label>
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-lg border border-white/20 bg-white/10 hover:scale-105 active:scale-95 transition" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar ou esconder senha">
            {showPassword ? 'Esconder' : 'Mostrar'}
          </button>
          {formState.errors.password && (<div className="text-red-300 text-xs mt-2">{formState.errors.password.message}</div>)}
        </div>

        <div className="relative mb-6">
          <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder=" " className="peer w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white placeholder-transparent px-3 py-3 outline-none transition focus:border-brand-700" aria-invalid={!!formState.errors.confirmPassword} {...register('confirmPassword')} />
          <label htmlFor="confirmPassword" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs">Confirmar Senha</label>
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-lg border border-white/20 bg-white/10 hover:scale-105 active:scale-95 transition" onClick={() => setShowConfirm((v) => !v)} aria-label="Mostrar ou esconder confirmação de senha">
            {showConfirm ? 'Esconder' : 'Mostrar'}
          </button>
          {formState.errors.confirmPassword && (<div className="text-red-300 text-xs mt-2">{formState.errors.confirmPassword.message}</div>)}
        </div>

        <button type="submit" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-brand-700 text-white hover:scale-[1.02] active:scale-95 transition duration-200 shadow-lg shadow-brand-700/30 disabled:opacity-50" disabled={!formState.isValid || formState.isSubmitting || !supabaseConfigOk}>
          {formState.isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
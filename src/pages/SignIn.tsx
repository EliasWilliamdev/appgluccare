import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigOk } from '../lib/supabaseClient'

const schema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória')
})

type FormValues = z.infer<typeof schema>

export default function SignIn() {
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiSuccess, setApiSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

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
    const { email, password } = values
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setApiError('E-mail ou senha inválidos')
      return
    }
    if (!data?.user) {
      setApiError('E-mail ou senha inválidos')
      return
    }
    setApiSuccess('Login realizado com sucesso.')
    reset({ email: '', password: '' })
    navigate('/app', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 dark:bg-neutral-900/50 backdrop-blur-xl text-neutral-800 dark:text-neutral-100 p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold mb-4 text-white">Entrar</h1>

        {!!apiError && (
          <div className="mb-3 rounded-xl border border-red-300/40 bg-red-500/10 text-red-200 px-3 py-2" role="alert" aria-live="polite">{apiError}</div>
        )}
        {!!apiSuccess && (
          <div className="mb-3 rounded-xl border border-emerald-300/40 bg-emerald-500/10 text-emerald-200 px-3 py-2" role="status" aria-live="polite">{apiSuccess}</div>
        )}

        <div className="relative mb-4">
          <input id="email" type="email" placeholder=" " className="peer w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white placeholder-transparent px-3 py-3 outline-none transition focus:border-brand-700" aria-invalid={!!formState.errors.email} {...register('email')} />
          <label htmlFor="email" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs">E-mail</label>
          {formState.errors.email && (<div className="text-red-300 text-xs mt-2">{formState.errors.email.message}</div>)}
        </div>

        <div className="relative mb-6">
          <input id="password" type="password" placeholder=" " className="peer w-full rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 text-white placeholder-transparent px-3 py-3 outline-none transition focus:border-brand-700" aria-invalid={!!formState.errors.password} {...register('password')} />
          <label htmlFor="password" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs">Senha</label>
          {formState.errors.password && (<div className="text-red-300 text-xs mt-2">{formState.errors.password.message}</div>)}
        </div>

        <button type="submit" className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-brand-700 text-white hover:scale-[1.02] active:scale-95 transition duration-200 shadow-lg shadow-brand-700/30 disabled:opacity-50" disabled={!formState.isValid || formState.isSubmitting || !supabaseConfigOk}>
          {formState.isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="mt-4 flex items-center justify-between text-xs text-white/80">
          <button type="button" className="px-2 py-1 rounded-lg border border-white/20 bg-white/10 hover:scale-105 active:scale-95 transition" aria-label="Esqueci minha senha" onClick={() => {}}>
            Esqueci minha senha
          </button>
          <Link to="/signup" className="px-2 py-1 rounded-lg border border-white/20 bg-white/10 hover:scale-105 active:scale-95 transition" aria-label="Ir para cadastro">
            Não tem uma conta? Cadastre-se
          </Link>
        </div>
      </form>
    </div>
  )
}
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigOk } from '../lib/supabaseClient'
import { Card, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import { LogIn } from 'lucide-react'

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
      toast.error('Configuração do Supabase ausente')
      return
    }
    const { email, password } = values
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setApiError('E-mail ou senha inválidos')
      toast.error('E-mail ou senha inválidos')
      return
    }
    if (!data?.user) {
      setApiError('E-mail ou senha inválidos')
      toast.error('E-mail ou senha inválidos')
      return
    }
    setApiSuccess('Login realizado com sucesso.')
    toast.success('Login realizado com sucesso')
    reset({ email: '', password: '' })
    navigate('/app', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
        <Card>
          <CardTitle>Entrar</CardTitle>

        {!!apiError && (
          <div className="mb-3 rounded-xl border border-red-300/40 bg-red-500/10 text-red-200 px-3 py-2" role="alert" aria-live="polite">{apiError}</div>
        )}
        {!!apiSuccess && (
          <div className="mb-3 rounded-xl border border-emerald-300/40 bg-emerald-500/10 text-emerald-200 px-3 py-2" role="status" aria-live="polite">{apiSuccess}</div>
        )}

          <div className="mb-4">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" aria-invalid={!!formState.errors.email} {...register('email')} />
            {formState.errors.email && (<div className="text-red-300 text-xs mt-2">{formState.errors.email.message}</div>)}
          </div>

          <div className="mb-6">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" aria-invalid={!!formState.errors.password} {...register('password')} />
            {formState.errors.password && (<div className="text-red-300 text-xs mt-2">{formState.errors.password.message}</div>)}
          </div>

          <Button type="submit" className="w-full" disabled={!formState.isValid || formState.isSubmitting || !supabaseConfigOk}>
            {formState.isSubmitting ? 'Entrando...' : 'Entrar'}
            {!formState.isSubmitting && <LogIn size={18} />}
          </Button>

          <div className="mt-4 flex items-center justify-between text-xs text-white/80">
            <Button type="button" variant="outline" size="sm" aria-label="Esqueci minha senha" onClick={() => {}}>
              Esqueci minha senha
            </Button>
            <Link to="/signup" className="text-xs underline underline-offset-4" aria-label="Ir para cadastro">
              Não tem uma conta? Cadastre-se
            </Link>
          </div>
        </Card>
      </form>
    </div>
  )
}

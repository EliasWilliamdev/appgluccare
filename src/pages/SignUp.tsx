import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase, supabaseConfigOk } from '../lib/supabaseClient'
import { Card, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import { UserPlus, Eye, EyeOff } from 'lucide-react'

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
      toast.error('Configuração do Supabase ausente')
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
      toast.error(error.message)
      return
    }
    if (!data?.user) {
      setApiError('Não foi possível criar o usuário no Supabase.')
      return
    }
    setApiSuccess('Cadastro realizado. Verifique seu e-mail para confirmar.')
    toast.success('Cadastro realizado. Verifique seu e-mail')
    reset({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
        <Card>
          <CardTitle>Cadastrar</CardTitle>

        {!!apiError && (
          <div className="mb-3 rounded-xl border border-red-300/40 bg-red-500/10 text-red-200 px-3 py-2" role="alert" aria-live="polite">{apiError}</div>
        )}
        {!!apiSuccess && (
          <div className="mb-3 rounded-xl border border-emerald-300/40 bg-emerald-500/10 text-emerald-200 px-3 py-2" role="status" aria-live="polite">{apiSuccess}</div>
        )}

          <div className="mb-4">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" type="text" aria-invalid={!!formState.errors.name} {...register('name')} />
            {formState.errors.name && (<div className="text-red-300 text-xs mt-2">{formState.errors.name.message}</div>)}
          </div>

          <div className="mb-4">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" aria-invalid={!!formState.errors.email} {...register('email')} />
            {formState.errors.email && (<div className="text-red-300 text-xs mt-2">{formState.errors.email.message}</div>)}
          </div>

          <div className="relative mb-4">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type={showPassword ? 'text' : 'password'} aria-invalid={!!formState.errors.password} {...register('password')} />
            <Button type="button" variant="outline" size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar ou esconder senha">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
            {formState.errors.password && (<div className="text-red-300 text-xs mt-2">{formState.errors.password.message}</div>)}
          </div>

          <div className="relative mb-6">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} aria-invalid={!!formState.errors.confirmPassword} {...register('confirmPassword')} />
            <Button type="button" variant="outline" size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowConfirm((v) => !v)} aria-label="Mostrar ou esconder confirmação de senha">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
            {formState.errors.confirmPassword && (<div className="text-red-300 text-xs mt-2">{formState.errors.confirmPassword.message}</div>)}
          </div>

          <Button type="submit" className="w-full" disabled={!formState.isValid || formState.isSubmitting || !supabaseConfigOk}>
            {formState.isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            {!formState.isSubmitting && <UserPlus size={18} />}
          </Button>
        </Card>
      </form>
    </div>
  )
}

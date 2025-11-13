import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import { useAuth } from './auth/AuthContext'

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark')
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])
  const DISCLAIMER_KEY = 'glucare_disclaimer_accepted_v1'
  function Disclaimer() {
    const [show, setShow] = useState(false)
    useEffect(() => {
      const accepted = localStorage.getItem(DISCLAIMER_KEY)
      setShow(!accepted)
    }, [])
    if (!show) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6 backdrop-blur-xl bg-black/40">
        <div className="max-w-xl w-full rounded-2xl border border-white/20 bg-white/10 dark:bg-neutral-900/50 shadow-2xl p-6 text-neutral-800 dark:text-neutral-100">
          <h2 className="text-2xl font-semibold mb-3">Aviso Legal/Médico</h2>
          <p className="text-sm opacity-90">
            Este aplicativo é uma ferramenta de acompanhamento e não substitui aconselhamento médico profissional,
            diagnóstico ou tratamento. Sempre consulte um profissional de saúde qualificado para dúvidas sobre sua
            condição médica.
          </p>
          <p className="text-sm mt-3 opacity-90">
            Ao continuar, você concorda com os nossos
            {' '}<a href="#" className="underline hover:opacity-80" aria-label="Termos de Serviço">Termos de Serviço</a>{' '}e{' '}
            <a href="#" className="underline hover:opacity-80" aria-label="Política de Privacidade">Política de Privacidade</a>.
          </p>
          <div className="mt-6 flex justify-end">
            <button className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-700 text-white hover:scale-[1.02] active:scale-95 transition duration-200 shadow-lg shadow-brand-700/30" onClick={() => { localStorage.setItem(DISCLAIMER_KEY, 'true'); setShow(false) }}>
              Eu entendo e concordo
            </button>
          </div>
        </div>
      </div>
    )
  }

  function RequireAuth({ children }: { children: ReactNode }) {
    const { session, loading } = useAuth()
    if (loading) return <div className="screen-center"><div className="card"><h1 className="card-title">Carregando...</h1></div></div>
    if (!session) return <Navigate to="/login" replace />
    return children
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 via-fuchsia-500 to-orange-400 dark:from-[#0f172a] dark:via-[#0b1328] dark:to-[#020617]">
      <div className="fixed top-4 right-4 z-50">
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 text-white hover:scale-105 active:scale-95 transition duration-200" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <span className="text-xs">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
      </div>
      <BrowserRouter>
        <Disclaimer />
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/app" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App

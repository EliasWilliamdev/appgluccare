import { Sun, Moon, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { supabase } from '../lib/supabaseClient'

export function AppHeader({ theme, setTheme }: { theme: 'dark' | 'light'; setTheme: (t: 'dark' | 'light') => void }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/10 dark:bg-black/20 border-b border-white/20">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Gluccare</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" aria-label="Alternar tema" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="text-xs">{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
          </Button>
          <Button variant="outline" size="sm" aria-label="Sair" onClick={() => supabase.auth.signOut()}>
            <LogOut size={16} />
            <span className="text-xs">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}


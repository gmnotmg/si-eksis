import { useTheme } from '../../hooks/useTheme.jsx'

export default function Topbar({ onMenuClick }) {
  const { dark, toggle } = useTheme()

  return (
    <header className="flex items-center justify-between gap-3 px-4 h-[57px] flex-shrink-0
                       bg-white border-b border-yellow-100">
      <button onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-yellow-50 text-stone-500 transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <div className="flex-1" />
      <button onClick={toggle}
        className="p-2 rounded-xl hover:bg-yellow-50 text-stone-500 transition-colors"
        title={dark ? 'Mode Terang' : 'Mode Gelap'}>
        {dark
          ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
        }
      </button>
    </header>
  )
}
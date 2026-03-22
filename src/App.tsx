import { useState, useEffect, useCallback } from 'react'
import { Header } from './components/Header'
import { JsonFormatter } from './components/JsonFormatter'
import { JsonCompare } from './components/JsonCompare'
import { useTheme } from './hooks/useTheme'

function App() {
  const [activeTab, setActiveTab] = useState<'formatter' | 'compare'>('formatter')
  const { theme, toggleTheme } = useTheme()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('json-tools-action'))
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main style={{ flex: 1, padding: '12px 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'formatter' ? <JsonFormatter /> : <JsonCompare />}
      </main>
    </div>
  )
}

export default App

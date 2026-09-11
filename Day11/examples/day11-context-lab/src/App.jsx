import './App.css'
import PropsDrillingDemo from './components/PropsDrillingDemo.jsx'
import ThemeToggleDemo from './components/ThemeToggleDemo.jsx'
import LanguageSwitchDemo from './components/LanguageSwitchDemo.jsx'

function App() {
  return (
    <div className="context-lab-page">
      <header className="page-header">
        <p className="eyebrow">Day 11 useContext 與跨層級資料傳遞</p>
        <h1>Context 實驗室</h1>
        <p className="subtitle">
          三個小型範例，依序練習：① Props Drilling
          的痛點示範、②用 <code>createContext</code> + <code>Provider</code> +{' '}
          <code>useContext</code> 打造深色 / 淺色主題切換、③多個獨立 Context 並存的語言切換。
        </p>
      </header>

      <main className="card-grid">
        <PropsDrillingDemo />
        <ThemeToggleDemo />
        <LanguageSwitchDemo />
      </main>
    </div>
  )
}

export default App

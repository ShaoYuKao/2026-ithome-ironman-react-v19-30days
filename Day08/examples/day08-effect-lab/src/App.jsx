import './App.css'
import EffectPlayground from './components/EffectPlayground.jsx'
import MountDemo from './components/MountDemo.jsx'
import Clock from './components/Clock.jsx'
import TodoApp from './components/TodoApp.jsx'

function App() {
  return (
    <div className="effect-lab-page">
      <header className="page-header">
        <p className="eyebrow">Day 08 useEffect 副作用處理</p>
        <h1>useEffect 實驗室</h1>
        <p className="subtitle">
          四個小型範例，依序體會依賴陣列（Dependency Array）的三種情境、掛載／卸載的清除函式（Cleanup Function）、
          計時器的建立與清除、以及把 Day07 手動同步 <code>localStorage</code> 的寫法，改成用 <code>useEffect</code> 自動處理。
          畫面上都附有即時的「執行紀錄」面板，實際操作按鈕就能看到每個 <code>useEffect</code> 何時被觸發。
        </p>
      </header>

      <main className="card-grid">
        <EffectPlayground />
        <MountDemo />
        <Clock />
        <TodoApp />
      </main>
    </div>
  )
}

export default App

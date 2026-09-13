import './App.css'
import WindowSizeDemo from './components/WindowSizeDemo.jsx'
import TodoApp from './components/TodoApp.jsx'
import PreferencesPanel from './components/PreferencesPanel.jsx'
import SidebarLayoutDemo from './components/SidebarLayoutDemo.jsx'

function App() {
  return (
    <div className="hook-lab-page">
      <header className="page-header">
        <p className="eyebrow">Day 13 自訂 Hook（Custom Hook）入門</p>
        <h1>自訂 Hook 實驗室</h1>
        <p className="subtitle">
          四個小型範例，依序練習：① <code>useWindowSize()</code> 在兩個獨立元件間共用同一套邏輯、
          ② 把 Day08 的 <code>localStorage</code> 同步邏輯抽成 <code>useLocalStorage(key, initialValue)</code>{' '}
          並用來重構待辦清單、③ 同一個 <code>useLocalStorage</code> 在完全不同的元件上第二次重複使用、
          ④ 組合 <code>useWindowSize</code> 與 <code>useLocalStorage</code> 兩個自訂 Hook，完成一個會記住偏好的響應式側邊欄。
        </p>
      </header>

      <main className="card-grid">
        <WindowSizeDemo />
        <TodoApp />
        <PreferencesPanel />
        <SidebarLayoutDemo />
      </main>
    </div>
  )
}

export default App

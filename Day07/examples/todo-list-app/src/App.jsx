import './App.css'
import TodoApp from './components/TodoApp.jsx'

function App() {
  return (
    <div className="todo-app-page">
      <header className="page-header">
        <p className="eyebrow">Day 07 週複習與小專案</p>
        <h1>待辦清單 App（Todo List）</h1>
        <p className="subtitle">
          統整第一週 Day01-06 所學：JSX 表達式、元件拆分與 Props 傳遞、State 集中管理於父層、
          事件處理、條件渲染與列表渲染，並加上 <code>localStorage</code> 持久化資料的加分項目，
          做出一個重新整理頁面也不會遺失資料、可正常運作的待辦清單 App。
        </p>
      </header>

      <main className="card-grid">
        <TodoApp />
      </main>
    </div>
  )
}

export default App

import './App.css'
import CounterCompareDemo from './components/CounterCompareDemo.jsx'
import TodoApp from './components/TodoApp.jsx'
import ShoppingCartDemo from './components/ShoppingCartDemo.jsx'
import GlobalCounterDemo from './components/GlobalCounterDemo.jsx'

function App() {
  return (
    <div className="reducer-lab-page">
      <header className="page-header">
        <p className="eyebrow">Day 12 useReducer 複雜狀態管理</p>
        <h1>useReducer 實驗室</h1>
        <p className="subtitle">
          四個小型範例，依序練習：① <code>useState</code> 與 <code>useReducer</code>
          的計數器對照、② 用 <code>useReducer</code> 管理彼此關聯的複雜狀態（購物車）、
          ③ 把 Day07 待辦清單重構成 <code>useReducer</code> 版本、④{' '}
          <code>useReducer</code> 搭配 <code>useContext</code> 的輕量級全域狀態管理。
        </p>
      </header>

      <main className="card-grid">
        <CounterCompareDemo />
        <ShoppingCartDemo />
        <TodoApp />
        <GlobalCounterDemo />
      </main>
    </div>
  )
}

export default App

import './App.css'
import TodoApp from './components/TodoApp.jsx'
import KeyPitfallDemo from './components/KeyPitfallDemo.jsx'

function App() {
  return (
    <div className="todo-app-page">
      <header className="page-header">
        <p className="eyebrow">Day 06 練習</p>
        <h1>條件渲染 &amp; 列表渲染</h1>
        <p className="subtitle">
          用待辦清單（Todo List）練習條件渲染的三種寫法（三元運算子、<code>&amp;&amp;</code>、
          提早 return）與 <code>.map()</code> 列表渲染，並額外示範 <code>key</code> 屬性對
          React 內部 diff 演算法的實際影響。
        </p>
      </header>

      <main className="card-grid">
        <TodoApp />
        <KeyPitfallDemo />
      </main>
    </div>
  )
}

export default App

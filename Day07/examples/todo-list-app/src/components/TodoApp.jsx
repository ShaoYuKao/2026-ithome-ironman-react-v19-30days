import { useState } from 'react'
import TodoInput from './TodoInput.jsx'
import TodoList from './TodoList.jsx'
import FilterBar from './FilterBar.jsx'
import { loadTodos, saveTodos } from '../utils/storage.js'

// FILTERS：把「篩選條件」對應成純函式，搭配 Array.prototype.filter 使用，
// 之後如果要新增篩選條件，只要在這裡多加一個 key 就好，不用動到渲染邏輯。（延續 Day06）
const FILTERS = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
}

function TodoApp() {
  // Lazy Initializer（Day04）：傳入 loadTodos 這個「函式本身」而不是 loadTodos()，
  // 確保讀取、解析 localStorage 這件事只在元件掛載的第一次渲染執行一次。
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState('all')

  // 把「更新 state」跟「同步寫回 localStorage」這兩件事包在同一個函式裡，
  // 呼叫端只需要準備好「下一份完整的 todos 陣列」丟進來即可，不用每個地方都重複寫一次
  // setTodos(...) + saveTodos(...) 兩行。
  //
  // 注意：這裡刻意不是把 saveTodos 塞進 setTodos(prev => ...) 的更新函式裡面——
  // 因為 React 在 StrictMode 下開發模式會刻意「多呼叫一次」state 更新函式，
  // 用來幫助偵測「不是純函式」的更新邏輯；如果把 localStorage.setItem 這種副作用
  // 寫在更新函式內部，就會被多執行一次而不易察覺。所以採用「先算出下一份新資料 next，
  // 再依序呼叫 setTodos(next) 與 saveTodos(next)」的寫法，讓更新函式維持單純。
  function updateTodos(nextTodos) {
    setTodos(nextTodos)
    saveTodos(nextTodos)
  }

  function handleAdd(text) {
    const newTodo = {
      id: crypto.randomUUID(), // 穩定且唯一的 id，之後渲染列表時當作 key（Day06）
      text,
      completed: false,
    }
    updateTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    updateTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    )
  }

  function handleDelete(id) {
    updateTodos(todos.filter((todo) => todo.id !== id))
  }

  function handleClearCompleted() {
    updateTodos(todos.filter((todo) => !todo.completed))
  }

  const visibleTodos = todos.filter(FILTERS[filter])
  const remainingCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.length - remainingCount

  return (
    <section className="card todo-card">
      <h2>📝 待辦清單（Todo List）</h2>
      <p className="card-desc">
        新增、刪除、標記完成、依完成狀態篩選顯示，並自動同步到瀏覽器的 <code>localStorage</code>
        ——重新整理頁面、甚至關掉分頁再打開，資料都還在。
      </p>

      <TodoInput onAdd={handleAdd} />
      <FilterBar
        filter={filter}
        onChangeFilter={setFilter}
        remainingCount={remainingCount}
        completedCount={completedCount}
        onClearCompleted={handleClearCompleted}
      />
      <TodoList todos={visibleTodos} onToggle={handleToggle} onDelete={handleDelete} />
    </section>
  )
}

export default TodoApp

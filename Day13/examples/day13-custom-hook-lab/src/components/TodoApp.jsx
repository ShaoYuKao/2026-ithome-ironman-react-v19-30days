import { useState } from 'react'
import TodoInput from './TodoInput.jsx'
import TodoList from './TodoList.jsx'
import FilterBar from './FilterBar.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const FILTERS = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
}

function TodoApp() {
  // Day08 版本原本要寫：
  //   const [todos, setTodos] = useState(loadTodos)
  //   useEffect(() => { saveTodos(todos) }, [todos])
  // 現在把「讀取初始值＋自動同步寫回 localStorage」整個交給 useLocalStorage 處理，
  // 元件只需要像使用一般 useState 一樣使用 todos / setTodos。
  const [todos, setTodos] = useLocalStorage('day13-todo-list', [])
  const [filter, setFilter] = useState('all')

  function handleAdd(text) {
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    }
    setTodos((prev) => [...prev, newTodo])
  }

  function handleToggle(id) {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    )
  }

  function handleDelete(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  function handleClearCompleted() {
    setTodos((prev) => prev.filter((todo) => !todo.completed))
  }

  const visibleTodos = todos.filter(FILTERS[filter])
  const remainingCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.length - remainingCount

  return (
    <section className="card">
      <h2>2️⃣ useLocalStorage 主練習：把 Day08 的同步邏輯抽出來</h2>
      <p className="card-desc">
        畫面行為跟 Day08 一模一樣：新增、勾選完成、刪除、篩選、清除已完成，
        重新整理頁面資料仍然保留。差別在於 <code>TodoApp</code> 元件本身完全不再出現
        <code>useEffect</code> 或 <code>localStorage</code> 這幾個字——這一整段邏輯已經被搬進
        <code>useLocalStorage(key, initialValue)</code> 這個自訂 Hook 裡，元件只需要呼叫它、
        像平常使用 <code>useState</code> 一樣使用 <code>todos</code> / <code>setTodos</code> 即可。
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

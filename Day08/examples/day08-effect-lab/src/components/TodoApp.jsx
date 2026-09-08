import { useEffect, useState } from 'react'
import TodoInput from './TodoInput.jsx'
import TodoList from './TodoList.jsx'
import FilterBar from './FilterBar.jsx'
import { loadTodos, saveTodos } from '../utils/storage.js'

const FILTERS = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
}

function TodoApp() {
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState('all')

  // Day07 版本：handleAdd / handleToggle / handleDelete / handleClearCompleted
  // 每一個都要「記得」額外呼叫 saveTodos(next)，才能把最新資料寫回 localStorage。
  //
  // Day08 版本：把「同步到 localStorage」這件事集中寫在這一個 useEffect 裡。
  // 依賴陣列是 [todos]，代表「只要 todos 這個 state 改變，就自動重新執行一次」——
  // 不管是新增、切換完成、刪除、還是清除已完成造成的改變，都會觸發，
  // 不用在下面每個 handler 裡各自重複呼叫 saveTodos，也不用擔心漏寫。
  useEffect(() => {
    saveTodos(todos)
  }, [todos])

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
      <h2>📝 待辦清單（改用 useEffect 同步 localStorage）</h2>
      <p className="card-desc">
        新增、刪除、切換完成、清除已完成時，這裡只需要專心呼叫 <code>setTodos</code> 更新畫面，
        「同步寫回 <code>localStorage</code>」已經交給上面那一個 <code>useEffect</code> 統一處理，
        重新整理頁面資料依然還在。
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

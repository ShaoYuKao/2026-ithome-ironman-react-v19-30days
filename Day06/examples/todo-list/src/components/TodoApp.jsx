import { useState } from 'react'
import TodoInput from './TodoInput.jsx'
import TodoList from './TodoList.jsx'
import FilterBar from './FilterBar.jsx'

// FILTERS：把「篩選條件」對應成純函式，搭配 Array.prototype.filter 使用，
// 之後如果要新增篩選條件，只要在這裡多加一個 key 就好，不用動到渲染邏輯。
const FILTERS = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
}

function TodoApp() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')

  function handleAdd(text) {
    const newTodo = {
      id: crypto.randomUUID(), // 用穩定且唯一的 id 當作日後的 key，不要用陣列 index
      text,
      completed: false,
    }
    setTodos((prev) => [...prev, newTodo])
  }

  function handleToggle(id) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  function handleDelete(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const visibleTodos = todos.filter(FILTERS[filter])
  const remainingCount = todos.filter((todo) => !todo.completed).length

  return (
    <section className="card todo-card">
      <h2>📝 待辦清單（Todo List）</h2>
      <p className="card-desc">
        新增、刪除、標記完成、依完成狀態篩選顯示——今天把 Day05 的輸入框練習擴充成完整的待辦清單。
      </p>

      <TodoInput onAdd={handleAdd} />
      <FilterBar
        filter={filter}
        onChangeFilter={setFilter}
        remainingCount={remainingCount}
      />
      <TodoList todos={visibleTodos} onToggle={handleToggle} onDelete={handleDelete} />
    </section>
  )
}

export default TodoApp

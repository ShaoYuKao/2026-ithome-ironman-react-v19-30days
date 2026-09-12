import TodoItem from './TodoItem.jsx'

function TodoList({ todos, onToggle, onDelete }) {
  // 提早 return（Day06）：清單是空的時候，直接回傳提示文字，完全不執行下面的 .map()
  if (todos.length === 0) {
    return <p className="empty-state">目前沒有符合條件的待辦事項</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}

export default TodoList

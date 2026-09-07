import TodoItem from './TodoItem.jsx'

function TodoList({ todos, onToggle, onDelete }) {
  // 提早 return（Day06）：清單是空的時候，直接回傳提示文字，完全不執行下面的 .map()
  if (todos.length === 0) {
    return <p className="empty-state">目前沒有符合條件的待辦事項</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        // key 用 todo.id（新增時由 crypto.randomUUID() 產生），不用陣列 index（Day06），
        // 避免刪除、篩選後列表重新排列時，React 錯把不同資料誤判成同一個節點。
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}

export default TodoList

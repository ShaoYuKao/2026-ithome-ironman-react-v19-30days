function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className="todo-item">
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
        {/* 三元運算子（Day06）：完成的項目多加一個 --done 樣式（刪除線） */}
        <span className={todo.completed ? 'todo-text todo-text--done' : 'todo-text'}>
          {todo.text}
        </span>
      </label>

      {/* && 寫法（Day06）：只有 todo.completed 為 true 時，才渲染「已完成」徽章 */}
      {todo.completed && <span className="badge">已完成</span>}

      <button type="button" className="todo-delete-btn" onClick={() => onDelete(todo.id)}>
        刪除
      </button>
    </li>
  )
}

export default TodoItem

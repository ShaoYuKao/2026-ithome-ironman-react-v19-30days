function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className="todo-item">
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
        <span className={todo.completed ? 'todo-text todo-text--done' : 'todo-text'}>
          {todo.text}
        </span>
      </label>

      {todo.completed && <span className="badge">已完成</span>}

      <button type="button" className="todo-delete-btn" onClick={() => onDelete(todo.id)}>
        刪除
      </button>
    </li>
  )
}

export default TodoItem

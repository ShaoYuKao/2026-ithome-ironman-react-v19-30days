import { useState } from 'react'

function TodoInput({ onAdd }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = text.trim()

    if (trimmed === '') {
      return
    }

    onAdd(trimmed)
    setText('')
  }

  return (
    <form className="todo-input-row" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="輸入待辦事項，按 Enter 或點擊新增"
        className="todo-input"
      />
      <button type="submit" className="todo-add-btn">
        新增
      </button>
    </form>
  )
}

export default TodoInput

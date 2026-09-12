import { useState } from 'react'

function TodoInput({ onAdd }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault() // 阻止表單送出時瀏覽器預設的整頁重新整理行為（Day05）
    onAdd(text)
    setText('')
  }

  return (
    <form className="todo-input-row" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="輸入待辦事項，按 Enter 或點擊新增"
        className="todo-input form-input"
      />
      <button type="submit" className="secondary-btn">
        新增
      </button>
    </form>
  )
}

export default TodoInput

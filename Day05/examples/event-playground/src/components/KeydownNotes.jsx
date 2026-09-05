import { useState } from 'react'

let nextNoteId = 1

function KeydownNotes() {
  const [draft, setDraft] = useState('')
  const [notes, setNotes] = useState([])

  // handleKeyDown 示範用 event.key 判斷「使用者按了哪一個鍵」，
  // 這是 onKeyDown 最常見的用法：Enter 送出、Escape 取消／清空。
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault() // 避免在 <input> 裡按 Enter 觸發外層 <form> 預設提交（若有的話）
      const trimmed = draft.trim()
      if (trimmed === '') return
      setNotes((prev) => [...prev, { id: nextNoteId++, text: trimmed }])
      setDraft('')
    } else if (event.key === 'Escape') {
      setDraft('')
    }
  }

  return (
    <section className="card">
      <h2>⏎ onKeyDown：Enter 新增、Esc 清空</h2>
      <p className="card-desc">
        在輸入框按 <kbd>Enter</kbd> 會把目前文字加進下方清單，按 <kbd>Esc</kbd>{' '}
        則會清空輸入框，兩者都是透過 <code>event.key</code> 判斷按下的按鍵名稱。
      </p>

      <input
        type="text"
        className="note-input"
        placeholder="輸入一則筆記，按 Enter 新增……"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
      />

      <ul className="note-list">
        {notes.length === 0 && <li className="note-list__empty">目前還沒有筆記</li>}
        {notes.map((note) => (
          <li key={note.id}>{note.text}</li>
        ))}
      </ul>
    </section>
  )
}

export default KeydownNotes

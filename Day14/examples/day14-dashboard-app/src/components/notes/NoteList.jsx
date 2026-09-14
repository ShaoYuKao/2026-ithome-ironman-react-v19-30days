// NoteList：跟 ContactList 一樣不拆出獨立的 Item 元件，直接在 .map() 裡渲染。
// 額外用 Intl.DateTimeFormat 把 ISO 字串格式化成比較好讀的日期時間，
// 是純 JavaScript 的運用，跟 React 本身無關。
const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function NoteList({ notes, onDelete }) {
  if (notes.length === 0) {
    return <p className="empty-hint">目前還沒有任何筆記。</p>
  }

  return (
    <ul className="item-list">
      {notes.map((note) => (
        <li key={note.id} className="item-row item-row--note">
          <div className="item-title-group">
            <span className="item-title">{note.title}</span>
            <p className="note-content">{note.content}</p>
            <span className="item-subtitle">{dateFormatter.format(new Date(note.createdAt))}</span>
          </div>
          <button type="button" className="delete-btn" onClick={() => onDelete(note.id)}>
            刪除
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList

import NoteForm from './NoteForm.jsx'
import NoteList from './NoteList.jsx'

// NotesPanel：三個分頁裡資料形狀最不同的一個（textarea 多行內容、有建立時間），
// 用來驗證同一套 Context + useReducer + 表單模式，能不能撐住「更豐富的資料形狀」。
function NotesPanel({ notes, dispatch }) {
  return (
    <div className="tab-content">
      <NoteForm
        onAdd={(title, content) => dispatch({ type: 'notes/add', payload: { title, content } })}
      />
      <NoteList notes={notes} onDelete={(id) => dispatch({ type: 'notes/delete', payload: { id } })} />
    </div>
  )
}

export default NotesPanel

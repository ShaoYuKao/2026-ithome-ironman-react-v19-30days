// ContactList：這裡刻意不像 TaskList 一樣再拆出 ContactItem 子元件——
// 因為每一筆聯絡人只是單純顯示三個欄位加一個刪除按鈕，JSX 不長也沒有獨立狀態，
// 直接在 .map() 裡面寫完就好（對照 Day03「何時該把畫面拆成子元件」的判斷原則：
// 邏輯複雜、有自己的 state、或需要在多處重複使用時才拆分，單純顯示不必為拆而拆）。
function ContactList({ contacts, onDelete }) {
  if (contacts.length === 0) {
    return <p className="empty-hint">目前還沒有任何聯絡人。</p>
  }

  return (
    <ul className="item-list">
      {contacts.map((contact) => (
        <li key={contact.id} className="item-row">
          <div className="item-title-group">
            <span className="item-title">{contact.name}</span>
            <span className="item-subtitle">
              {contact.email}
              {contact.phone && ` · ${contact.phone}`}
            </span>
          </div>
          <button type="button" className="delete-btn" onClick={() => onDelete(contact.id)}>
            刪除
          </button>
        </li>
      ))}
    </ul>
  )
}

export default ContactList

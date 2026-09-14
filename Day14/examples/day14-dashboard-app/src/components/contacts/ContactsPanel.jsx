import ContactForm from './ContactForm.jsx'
import ContactList from './ContactList.jsx'

// ContactsPanel：資料形狀跟 tasks 完全不同（沒有 completed / priority，多了 email、phone），
// 用來驗證 dashboardReducer、表單驗證這一整套模式是否真的可以套用在「不同形狀的資料」上，
// 呼應 Day13「useLocalStorage 在完全不同元件上第二次重複使用」想驗證的同一件事。
function ContactsPanel({ contacts, dispatch }) {
  return (
    <div className="tab-content">
      <ContactForm
        onAdd={(name, email, phone) =>
          dispatch({ type: 'contacts/add', payload: { name, email, phone } })
        }
      />
      <ContactList
        contacts={contacts}
        onDelete={(id) => dispatch({ type: 'contacts/delete', payload: { id } })}
      />
    </div>
  )
}

export default ContactsPanel

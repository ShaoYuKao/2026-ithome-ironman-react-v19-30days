/**
 * 單一聯絡人列。純展示用途，本身沒有昂貴運算——
 * 今天所有的「花費時間」都刻意集中在 searchContacts 這個純函式裡，
 * 方便你只需要專心觀察「這段計算什麼時候被呼叫、被誰排程」。
 */
function ContactRow({ contact }) {
  return (
    <li className="contact-row">
      <span className="contact-row__name">{contact.name}</span>
      <span className="contact-row__email">{contact.email}</span>
      <span className="contact-row__city">{contact.city}</span>
      <span className="contact-row__department">{contact.department}</span>
    </li>
  )
}

export default ContactRow

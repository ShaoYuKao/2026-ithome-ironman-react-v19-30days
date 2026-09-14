import { useState } from 'react'
import FieldError from '../FieldError.jsx'
import { initialContactFormData, validateContactForm } from '../../utils/validators.js'

// ContactForm：跟 TaskForm 一樣是受控表單，但欄位形狀完全不同——
// 這裡示範「動態 key 更新」的 handleChange 寫法（Day09），
// 用 event.target.name 當作 state 物件的 key，同一個 handleChange 處理三個欄位。
function ContactForm({ onAdd }) {
  const [formData, setFormData] = useState(initialContactFormData)
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateContactForm(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    onAdd(formData.name, formData.email, formData.phone)
    setFormData(initialContactFormData)
    setErrors({})
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label className="form-label" htmlFor="contact-name">
          姓名
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          className="form-input"
          value={formData.name}
          onChange={handleChange}
          placeholder="請輸入姓名"
        />
        <FieldError message={errors.name} />
      </div>

      <div className="form-field form-field--grow">
        <label className="form-label" htmlFor="contact-email">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          className="form-input"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
        />
        <FieldError message={errors.email} />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="contact-phone">
          電話（選填）
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="text"
          className="form-input"
          value={formData.phone}
          onChange={handleChange}
          placeholder="0912-345-678"
        />
        <FieldError message={errors.phone} />
      </div>

      <button type="submit" className="submit-btn">
        新增聯絡人
      </button>
    </form>
  )
}

export default ContactForm

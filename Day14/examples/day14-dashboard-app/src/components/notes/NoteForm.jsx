import { useState } from 'react'
import FieldError from '../FieldError.jsx'
import { initialNoteFormData, validateNoteForm } from '../../utils/validators.js'

// NoteForm：跟 TaskForm、ContactForm 同一套受控表單寫法，
// 差別只在多了一個 <textarea>——textarea 在 React 裡一樣是用 value + onChange 綁定，
// 跟 <input> 的受控寫法完全一致，不需要另外處理。
function NoteForm({ onAdd }) {
  const [formData, setFormData] = useState(initialNoteFormData)
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateNoteForm(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    onAdd(formData.title, formData.content)
    setFormData(initialNoteFormData)
    setErrors({})
  }

  return (
    <form className="stacked-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label className="form-label" htmlFor="note-title">
          筆記標題
        </label>
        <input
          id="note-title"
          name="title"
          type="text"
          className="form-input"
          value={formData.title}
          onChange={handleChange}
          placeholder="例如：本週學習心得"
        />
        <FieldError message={errors.title} />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="note-content">
          筆記內容
        </label>
        <textarea
          id="note-content"
          name="content"
          className="form-input form-textarea"
          value={formData.content}
          onChange={handleChange}
          rows={3}
          placeholder="寫下今天學到的重點……"
        />
        <FieldError message={errors.content} />
      </div>

      <button type="submit" className="submit-btn submit-btn--full">
        新增筆記
      </button>
    </form>
  )
}

export default NoteForm

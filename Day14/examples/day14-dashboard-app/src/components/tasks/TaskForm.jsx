import { useState } from 'react'
import FieldError from '../FieldError.jsx'
import { initialTaskFormData, PRIORITY_OPTIONS, validateTaskForm } from '../../utils/validators.js'

// TaskForm：受控表單（Day09）——title、priority 都是「值 + onChange」綁定的受控欄位。
// 送出時才正式驗證一次並阻止表單預設的整頁刷新行為（event.preventDefault()）。
function TaskForm({ onAdd }) {
  const [formData, setFormData] = useState(initialTaskFormData)
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateTaskForm(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    onAdd(formData.title, formData.priority)
    setFormData(initialTaskFormData)
    setErrors({})
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field form-field--grow">
        <label className="form-label" htmlFor="task-title">
          任務名稱
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          className="form-input"
          value={formData.title}
          onChange={handleChange}
          placeholder="例如：完成本週複習筆記"
        />
        <FieldError message={errors.title} />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="task-priority">
          優先度
        </label>
        <select
          id="task-priority"
          name="priority"
          className="form-input"
          value={formData.priority}
          onChange={handleChange}
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-btn">
        新增任務
      </button>
    </form>
  )
}

export default TaskForm

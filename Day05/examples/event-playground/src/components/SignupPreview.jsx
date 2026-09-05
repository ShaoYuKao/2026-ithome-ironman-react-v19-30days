import { useState } from 'react'

const initialForm = { nickname: '', email: '' }

function SignupPreview() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)

  // 多欄位表單只用一個 state 物件管理，用 event.target.name 當作動態 key，
  // 展開原本的 form 物件再覆蓋對應欄位，維持不可變更新（immutability）。
  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function validate(values) {
    const nextErrors = {}
    if (values.nickname.trim() === '') {
      nextErrors.nickname = '暱稱為必填欄位'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Email 格式不正確'
    }
    return nextErrors
  }

  function handleSubmit(event) {
    // 表單送出的預設行為是「整頁重新整理並帶著資料導向新網址」，
    // 在 SPA 裡幾乎都不需要這個行為，所以一律先呼叫 preventDefault() 擋掉。
    event.preventDefault()

    const nextErrors = validate(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(form)
    } else {
      setSubmitted(null)
    }
  }

  return (
    <section className="card">
      <h2>📮 onSubmit：preventDefault + 表單驗證</h2>
      <p className="card-desc">
        送出時先用 <code>event.preventDefault()</code> 擋掉瀏覽器預設的整頁重新整理，
        再對兩個受控欄位做基本驗證，全部通過才顯示「送出結果」預覽。
      </p>

      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <label className="form-field">
          <span>暱稱</span>
          <input
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
          />
          {errors.nickname && <small className="form-error">{errors.nickname}</small>}
        </label>

        <label className="form-field">
          <span>Email</span>
          <input type="text" name="email" value={form.email} onChange={handleChange} />
          {errors.email && <small className="form-error">{errors.email}</small>}
        </label>

        <button type="submit">送出</button>
      </form>

      {submitted && (
        <p className="event-log">
          ✅ 送出成功：<code>{submitted.nickname}</code> / <code>{submitted.email}</code>
        </p>
      )}
    </section>
  )
}

export default SignupPreview

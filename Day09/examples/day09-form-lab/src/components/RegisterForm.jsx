import { useState } from 'react'
import FieldError from './FieldError.jsx'
import {
  CITY_OPTIONS,
  GENDER_OPTIONS,
  initialRegisterFormData,
  validateRegisterForm,
} from '../utils/validators.js'

// 今日主練習：會員註冊表單
//
// 重點整理：
// 1. 多欄位表單狀態管理：所有欄位集中放在同一個 formData state 物件裡，
//    搭配「動態 key 更新」的 handleChange，不需要為每個欄位各寫一個 useState / 各寫一個 handler。
// 2. 每個欄位都是受控元件：text / password 用 value + onChange；
//    checkbox 用 checked + onChange；select 用 value + onChange。
// 3. 表單驗證：送出時（onSubmit）才「正式」驗證一次並阻止預設行為（表單預設會整頁重新整理）；
//    送出過一次之後，改成使用者每次修改欄位就「即時」重新驗證，錯誤訊息修正後會立刻消失。
function RegisterForm() {
  const [formData, setFormData] = useState(initialRegisterFormData)
  const [errors, setErrors] = useState({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)

  // 動態 key 更新的關鍵：用 event.target.name 當作 state 物件的 key，
  // 搭配運算式屬性名稱 [name]，同一個 handleChange 就能處理表單裡所有欄位，
  // 不用像「一個欄位一個 useState + 一個 handler」那樣重複寫很多次。
  function handleChange(event) {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value
    const nextFormData = { ...formData, [name]: nextValue }

    setFormData(nextFormData)

    // 使用者已經按過一次「註冊」之後，改成即時驗證：
    // 只要這次修改讓某個欄位符合規則了，那個欄位的錯誤訊息就會立刻消失，體驗更好。
    if (hasSubmitted) {
      setErrors(validateRegisterForm(nextFormData))
    }
  }

  function handleSubmit(event) {
    // 表單送出的預設行為是「整頁重新整理並帶上表單資料」，SPA 裡幾乎都要阻止這個預設行為，
    // 改由 JavaScript 自己決定要怎麼處理（這裡是驗證 + 顯示結果）。
    event.preventDefault()

    const validationErrors = validateRegisterForm(formData)
    setErrors(validationErrors)
    setHasSubmitted(true)

    if (Object.keys(validationErrors).length > 0) {
      setSubmittedData(null)
      return
    }

    // 驗證通過：模擬「註冊成功」，顯示送出的資料摘要，並清空表單準備下一次填寫。
    setSubmittedData(formData)
    setFormData(initialRegisterFormData)
    setErrors({})
    setHasSubmitted(false)
  }

  return (
    <section className="card">
      <h2>5️⃣ 動手實作：會員註冊表單</h2>
      <p className="card-desc">
        整合本日所學：文字輸入、密碼確認、性別 / 城市下拉選單、訂閱電子報 checkbox，
        全部欄位皆為受控元件，並集中管理在同一個 <code>formData</code> state 物件中。
      </p>

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="reg-name">
            姓名
          </label>
          <input
            id="reg-name"
            name="name"
            type="text"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="請輸入姓名"
          />
          <FieldError message={errors.name} />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="reg-email">
            Email
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
          />
          <FieldError message={errors.email} />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="reg-password">
              密碼
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="至少 8 個字元"
            />
            <FieldError message={errors.password} />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="reg-confirm-password">
              確認密碼
            </label>
            <input
              id="reg-confirm-password"
              name="confirmPassword"
              type="password"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="再輸入一次密碼"
            />
            <FieldError message={errors.confirmPassword} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="reg-gender">
              性別
            </label>
            <select
              id="reg-gender"
              name="gender"
              className="form-input"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">請選擇性別</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.gender} />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="reg-city">
              居住城市
            </label>
            <select
              id="reg-city"
              name="city"
              className="form-input"
              value={formData.city}
              onChange={handleChange}
            >
              <option value="">請選擇城市</option>
              {CITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.city} />
          </div>
        </div>

        <div className="form-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="subscribeNewsletter"
              checked={formData.subscribeNewsletter}
              onChange={handleChange}
            />
            訂閱電子報，接收最新活動與優惠通知
          </label>
        </div>

        <button type="submit" className="submit-btn">
          註冊
        </button>
      </form>

      {submittedData && (
        <div className="success-banner">
          <p>🎉 註冊成功！送出的資料如下：</p>
          <ul className="summary-list">
            <li>姓名：{submittedData.name}</li>
            <li>Email：{submittedData.email}</li>
            <li>
              性別：{GENDER_OPTIONS.find((option) => option.value === submittedData.gender)?.label}
            </li>
            <li>
              居住城市：{CITY_OPTIONS.find((option) => option.value === submittedData.city)?.label}
            </li>
            <li>訂閱電子報：{submittedData.subscribeNewsletter ? '是' : '否'}</li>
          </ul>
        </div>
      )}
    </section>
  )
}

export default RegisterForm

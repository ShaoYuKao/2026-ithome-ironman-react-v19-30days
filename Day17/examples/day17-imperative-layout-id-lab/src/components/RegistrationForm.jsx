import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import CustomInput from './CustomInput.jsx'

const FIELD_ORDER = ['name', 'email', 'password']

function validate(values) {
  const errors = {}
  if (!values.name.trim()) {
    errors.name = '請輸入姓名'
  }
  if (!values.email.trim()) {
    errors.email = '請輸入 Email'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Email 格式不正確'
  }
  if (!values.password) {
    errors.password = '請輸入密碼'
  } else if (values.password.length < 6) {
    errors.password = '密碼至少需要 6 個字元'
  }
  return errors
}

/**
 * 練習主題（對照 plan03.md）：用 forwardRef + useImperativeHandle 做一個
 * 可被父元件呼叫 focus()／clear() 方法的自訂輸入框元件。
 *
 * 這裡刻意做成一個「會員註冊表單」情境：三個欄位都是 CustomInput 的獨立實例，
 * 各自有一個獨立的 ref。按下「註冊」但驗證沒過時，不透過任何 state 或
 * CSS 條件渲染，而是直接對「第一個有錯誤的欄位」呼叫 shake()、focus() ——
 * 這正是 useImperativeHandle 存在的意義：把「聚焦」「抖動」這種命令式、
 * 一次性的 DOM 操作，包裝成一個清楚的方法呼叫，而不是額外設計一組
 * state 去驅動它。
 */
function RegistrationForm() {
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submittedCount, setSubmittedCount] = useState(0)

  // 每個 CustomInput 都是獨立元件實例，各自需要一個獨立的 ref，
  // 才能個別呼叫它暴露出來的 focus()／clear()／shake()。
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const fieldRefs = { name: nameRef, email: emailRef, password: passwordRef }

  function handleChange(field) {
    return (event) => {
      const value = event.target.value
      setValues((prev) => ({ ...prev, [field]: value }))
    }
  }

  function handleReset() {
    setValues({ name: '', email: '', password: '' })
    setErrors({})
    FIELD_ORDER.forEach((field) => fieldRefs[field].current?.clear())
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    const firstInvalidField = FIELD_ORDER.find((field) => nextErrors[field])

    if (firstInvalidField) {
      // 這裡刻意用 flushSync 包住 setErrors：如果只是平常呼叫 setErrors，
      // React 會把這次更新「批次處理」，等這個事件處理函式整個執行完
      // 才真正 re-render + commit。但下面馬上就要呼叫 shake() 直接對 DOM
      // 加上 class ——如果 commit 發生在 shake() 之後，React 用 JSX 算出來
      // 的 className（不知道有 shake 這件事）會直接整個蓋掉剛剛加上去的
      // class，讓抖動動畫完全播不出來。用 flushSync 強制「setErrors →
      // re-render → 套用新 className」立刻同步跑完，之後才呼叫 shake()，
      // 就能確保新加上去的 class 不會被稍後才發生的 render 蓋掉。
      flushSync(() => {
        setErrors(nextErrors)
      })
      // 核心示範：直接呼叫子元件暴露出來的命令式方法，
      // 完全不需要額外設計「哪個欄位要抖動」「聚焦到誰」的 state。
      fieldRefs[firstInvalidField].current?.shake()
      fieldRefs[firstInvalidField].current?.focus()
      return
    }

    setErrors(nextErrors)
    setSubmittedCount((count) => count + 1)
    handleReset()
  }

  return (
    <div className="demo-card">
      <h2>forwardRef + useImperativeHandle：自訂輸入框</h2>
      <p className="demo-desc">
        每個欄位都是 <code>CustomInput</code> 元件的獨立實例，各自暴露{' '}
        <code>focus()</code>／<code>clear()</code>／<code>shake()</code>{' '}
        三個命令式方法。故意什麼都不填就按下「註冊」，觀察第一個有錯誤的欄位
        是不是會自動「抖動＋聚焦」——這個效果完全由 <code>RegistrationForm</code>{' '}
        直接呼叫 ref 上的方法觸發，<code>CustomInput</code> 本身不需要知道
        「什麼時候該抖動」這件事的判斷邏輯。
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <CustomInput
          ref={nameRef}
          label="姓名"
          value={values.name}
          onChange={handleChange('name')}
          error={errors.name}
        />
        <CustomInput
          ref={emailRef}
          label="Email"
          type="email"
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
        />
        <CustomInput
          ref={passwordRef}
          label="密碼"
          type="password"
          hint="至少需要 6 個字元"
          value={values.password}
          onChange={handleChange('password')}
          error={errors.password}
        />

        <div className="demo-actions">
          <button type="submit" className="btn btn--primary">
            註冊
          </button>
          <button type="button" className="btn" onClick={handleReset}>
            全部清空（呼叫每個欄位的 clear()）
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => nameRef.current?.focus()}
          >
            聚焦到姓名欄位（呼叫 focus()）
          </button>
        </div>
      </form>

      {submittedCount > 0 && (
        <p className="demo-success">
          ✅ 已成功送出 {submittedCount} 次（本範例僅示範前端驗證與命令式操作，未串接後端
          API）
        </p>
      )}
    </div>
  )
}

export default RegistrationForm

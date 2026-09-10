import { useEffect, useRef, useState } from 'react'

// 實驗一：自動聚焦輸入框（useRef 取得 DOM 節點最典型的情境）
//
// 核心觀念：
// 1. 幫 <input> 加上 ref={someRef}，React 掛載完成後，會把「這個 input 的實際 DOM 節點」
//    存進 someRef.current，之後就能呼叫瀏覽器原生的 DOM API，例如 someRef.current.focus()。
// 2. DOM 節點只有在「掛載完成之後」才存在，所以呼叫 .focus() 這類操作，
//    一定要寫在 useEffect（或事件處理函式）裡，不能直接寫在元件函式最外層（那時 DOM 還沒生出來）。
const STEPS = [
  { key: 'account', label: '帳號', placeholder: '請輸入帳號', type: 'text' },
  { key: 'password', label: '密碼', placeholder: '請輸入密碼', type: 'password' },
  { key: 'nickname', label: '暱稱', placeholder: '想讓大家怎麼稱呼你？', type: 'text' },
]

function AutoFocusDemo() {
  const [step, setStep] = useState(0)

  // 用一個「陣列形式」的 ref，存放每一步驟輸入框各自的 DOM 節點，
  // 陣列的 index 對應 STEPS 的 index，之後要聚焦第幾步驟，就讀取 inputRefs.current[index]。
  const inputRefs = useRef([])

  useEffect(() => {
    // 每次 step 改變（換到下一步）都會重新執行這個 effect，
    // 讓「目前這一步」的輸入框自動取得焦點，使用者不用自己動手點擊就能直接打字。
    inputRefs.current[step]?.focus()
  }, [step])

  function handleNext() {
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  function handleReset() {
    setStep(0)
  }

  const isLastStep = step === STEPS.length - 1

  return (
    <section className="card">
      <h2>1️⃣ 自動聚焦輸入框</h2>
      <p className="card-desc">
        模擬「分步驟填寫」的小表單：每次切換到下一步，該步驟的輸入框都會自動取得焦點（cursor
        直接出現在輸入框裡），使用者不需要自己動手點擊。實作關鍵是把 DOM 節點存進{' '}
        <code>inputRefs.current[step]</code>，並在 <code>useEffect</code> 裡呼叫{' '}
        <code>.focus()</code>。
      </p>

      <div className="step-indicator">
        {STEPS.map((s, index) => (
          <span
            key={s.key}
            className={`step-dot ${index === step ? 'step-dot--active' : ''} ${
              index < step ? 'step-dot--done' : ''
            }`}
          >
            {index + 1}. {s.label}
          </span>
        ))}
      </div>

      <div className="step-fields">
        {STEPS.map((s, index) => (
          <div
            key={s.key}
            className="form-field"
            // 三個輸入框其實同時存在於 DOM 裡，只是用 CSS 把「非目前步驟」的欄位藏起來，
            // 這樣每一個輸入框才都能各自保有自己的 ref，示範起來更單純。
            style={{ display: step === index ? 'flex' : 'none' }}
          >
            <label className="form-label" htmlFor={`autofocus-${s.key}`}>
              {s.label}
            </label>
            <input
              id={`autofocus-${s.key}`}
              type={s.type}
              className="form-input"
              placeholder={s.placeholder}
              // ref callback：React 會在 DOM 節點建立時呼叫這個函式並傳入節點本身，
              // 節點被移除時則會呼叫一次並傳入 null，我們把它存進陣列對應的 index 裡。
              ref={(element) => {
                inputRefs.current[index] = element
              }}
            />
          </div>
        ))}
      </div>

      <div className="button-row">
        <button type="button" className="secondary-btn" onClick={handleReset}>
          重新開始（聚焦第一步）
        </button>
        {!isLastStep && (
          <button type="button" className="secondary-btn" onClick={handleNext}>
            下一步
          </button>
        )}
      </div>

      <p className="form-hint">
        目前在第 {step + 1} / {STEPS.length} 步：「{STEPS[step].label}
        」，切換步驟時觀察 cursor 是否自動跳到新欄位裡。
      </p>
    </section>
  )
}

export default AutoFocusDemo

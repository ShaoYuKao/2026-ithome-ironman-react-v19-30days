import { useState } from 'react'

const PAYMENT_OPTIONS = [
  { value: 'credit-card', label: '信用卡' },
  { value: 'atm', label: 'ATM 轉帳' },
  { value: 'cod', label: '貨到付款' },
]

// 實驗三：<input type="radio"> 的資料綁定
//
// 同一組 radio 按鈕必須共用同一個 name，這樣瀏覽器才知道它們是「互斥的一組」。
// React 端的綁定方式：每一顆 radio 的 checked 都跟「state 是否等於自己的 value」比較，
// onChange 時直接把 state 設成「被選到的那顆」的 value，不需要額外處理「取消其他顆」，
// 因為同一時間只會有一個 radio 的 checked 為 true。
function RadioGroupDemo() {
  const [paymentMethod, setPaymentMethod] = useState('credit-card')

  return (
    <section className="card">
      <h2>3️⃣ Radio 單選按鈕綁定</h2>
      <p className="card-desc">
        同一組 radio 要有相同的 <code>name</code>，並用「<code>checked</code> 是否等於目前
        state」搭配 <code>onChange</code> 更新 state，達成單選效果。
      </p>

      <div className="radio-group">
        {PAYMENT_OPTIONS.map((option) => (
          <label key={option.value} className="radio-label">
            <input
              type="radio"
              name="payment-method"
              value={option.value}
              checked={paymentMethod === option.value}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      <p className="live-echo">
        目前選擇的付款方式：
        <strong>{PAYMENT_OPTIONS.find((option) => option.value === paymentMethod)?.label}</strong>
      </p>
    </section>
  )
}

export default RadioGroupDemo

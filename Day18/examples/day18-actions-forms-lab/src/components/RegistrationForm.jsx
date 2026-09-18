import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import FieldError from './FieldError.jsx'
import SubmitButton from './SubmitButton.jsx'
import { registerUser } from '../utils/api.js'
import { CITY_OPTIONS, GENDER_OPTIONS, validateRegisterForm } from '../utils/validators.js'

const initialState = { status: 'idle', errors: {}, message: '' }

/**
 * registerAction：傳給 useActionState 的 action 函式。
 * 簽章固定是 (previousState, formData) => nextState，跟 useReducer 的
 * reducer 長得很像，差別是這裡「可以」是 async 函式。
 *
 * 特別設計成「先同步檢查、再非同步檢查」兩個階段，藉此示範一件事：
 * useActionState 的 isPending，涵蓋的是「整個 action 函式」執行的時間，
 * 不管中間是同步驗證還是真的網路請求，呼叫端完全不需要區分兩者。
 */
async function registerAction(previousState, formData) {
  const values = {
    name: (formData.get('name') ?? '').toString().trim(),
    email: (formData.get('email') ?? '').toString().trim(),
    password: (formData.get('password') ?? '').toString(),
    confirmPassword: (formData.get('confirmPassword') ?? '').toString(),
    gender: (formData.get('gender') ?? '').toString(),
    city: (formData.get('city') ?? '').toString(),
    subscribeNewsletter: formData.get('subscribeNewsletter') === 'on',
  }

  // Step 1：跟 Day09 一模一樣的同步檢查，不需要問伺服器就能判斷。
  const clientErrors = validateRegisterForm(values)
  if (Object.keys(clientErrors).length > 0) {
    return { status: 'error', errors: clientErrors, message: '請修正下方標示的欄位' }
  }

  // Step 2：一定得問伺服器才會知道的規則（Email 是否已被註冊），這裡會有
  // 一段真實的網路延遲（server/index.js 故意 delay 1 秒）——這段 await
  // 期間，useActionState 回傳的 isPending、useFormStatus 的 pending
  // 都會是 true，畫面上的送出按鈕也會被 SubmitButton 自動 disable。
  try {
    const result = await registerUser(values)
    if (!result.success) {
      return {
        status: 'error',
        errors: result.errors ?? {},
        message: result.message ?? '註冊失敗，請確認欄位內容',
      }
    }
    return {
      status: 'success',
      errors: {},
      message: `🎉 ${result.message}！歡迎加入，${result.user.name}`,
    }
  } catch (networkError) {
    // 重點：一定要自己 catch！如果讓例外直接往外丟，React 會把它當成
    // 「渲染錯誤」，觸發最近的 Error Boundary，而不是被 useActionState
    // 優雅地包成一個可以顯示在畫面上的錯誤 state。
    return {
      status: 'error',
      errors: {},
      message: `無法連線到伺服器，請確認後端服務（server/）是否已啟動：${networkError.message}`,
    }
  }
}

function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState)

  // ❌ 錯誤示範，刻意留著讓你動手驗證：在「渲染 <form> 的同一個元件」裡
  // 呼叫 useFormStatus()。這裡的 wrongStatus.pending 永遠是 false，
  // 因為 RegistrationForm 相對於它自己渲染出來的 <form> 來說，是「外層」
  // 而不是「內層」——useFormStatus 只看得到「父層 <form>」的狀態，
  // 而不是同一層或自己渲染出來的 <form>。真正能拿到 pending: true 的，
  // 是被放在 <form> 標籤「裡面」的 SubmitButton（見下方 JSX 與其原始碼註解）。
  const wrongStatus = useFormStatus()

  return (
    <section className="demo-card">
      <h2>1️⃣ useActionState + useFormStatus：會員註冊表單</h2>
      <p className="demo-desc">
        改寫自 Day09 的會員註冊表單：欄位與驗證規則不變，但送出方式從
        「<code>onSubmit</code> + 手動管理 <code>isSubmitting</code>／<code>errors</code>
        等一堆 state」，換成「一個 <code>registerAction</code> 函式 + <code>useActionState</code>」。
        這裡也串接了真正的後端（Express <code>/api/register</code>），送出後會有約 1
        秒網路延遲，並會檢查 Email 是否已被註冊。
      </p>

      <form action={formAction} className="register-form" noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="reg-name">
            姓名
          </label>
          <input id="reg-name" name="name" type="text" className="form-input" placeholder="請輸入姓名" />
          <FieldError message={state.errors.name} />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="reg-email">
            Email
          </label>
          <input id="reg-email" name="email" type="email" className="form-input" placeholder="name@example.com" />
          <FieldError message={state.errors.email} />
          <p className="field-hint">
            💡 試著輸入 <code>test@example.com</code>：這是伺服器端模擬「已經被註冊過」的帳號，
            只有問過伺服器才驗證得出來。
          </p>
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
              placeholder="至少 8 個字元"
            />
            <FieldError message={state.errors.password} />
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
              placeholder="再輸入一次密碼"
            />
            <FieldError message={state.errors.confirmPassword} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="reg-gender">
              性別
            </label>
            <select id="reg-gender" name="gender" className="form-input" defaultValue="">
              <option value="">請選擇性別</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={state.errors.gender} />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="reg-city">
              居住城市
            </label>
            <select id="reg-city" name="city" className="form-input" defaultValue="">
              <option value="">請選擇城市</option>
              {CITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={state.errors.city} />
          </div>
        </div>

        <div className="form-field">
          <label className="checkbox-label">
            <input type="checkbox" name="subscribeNewsletter" />
            訂閱電子報，接收最新活動與優惠通知
          </label>
        </div>

        {state.status === 'error' && state.message && (
          <p className="form-banner form-banner--error" role="alert">
            ⚠️ {state.message}
          </p>
        )}
        {state.status === 'success' && state.message && (
          <p className="form-banner form-banner--success">{state.message}</p>
        )}

        <div className="demo-actions">
          <SubmitButton pendingLabel="註冊中...">註冊</SubmitButton>
          <span className="status-chip">
            ✅ useActionState 的 isPending：<strong>{String(isPending)}</strong>
          </span>
          <span className="status-chip status-chip--wrong">
            ❌ 同層呼叫 useFormStatus 的 pending：<strong>{String(wrongStatus.pending)}</strong>
          </span>
        </div>
      </form>
    </section>
  )
}

export default RegistrationForm

import { Form, useActionData, useNavigation, useSearchParams } from 'react-router'

// LoginPage：路由 "/login"。實際的 loginAction 定義在
// ../auth/loginAction.js（router.jsx 會直接從那裡 import 給路由設定用），
// 這裡只保留畫面本身，避免同一個檔案同時 export 元件與一般函式
// （會讓 Fast Refresh 失效，oxlint 的 react/only-export-components 也會警告）。
function LoginPage() {
  const [searchParams] = useSearchParams()
  const actionData = useActionData()
  const navigation = useNavigation()

  const from = searchParams.get('from') || '/dashboard'
  // navigation.state 在表單送出、action 執行、redirect 完成前都會是
  // 'submitting'，可以用來顯示「登入中…」、停用送出按鈕，避免使用者
  // 重複點擊。
  const isSubmitting = navigation.state === 'submitting'

  return (
    <div className="page-inner page-inner--narrow">
      <header className="page-header">
        <p className="eyebrow">Day 24 練習</p>
        <h1>登入</h1>
        <p className="subtitle">
          測試帳號：<code>demo</code> / <code>demo1234</code>（一般會員），或{' '}
          <code>admin</code> / <code>admin1234</code>（管理員）
        </p>
      </header>

      <Form method="post" className="auth-form">
        {/* 隱藏欄位：把「使用者原本想去的頁面」一起送給 loginAction，
            登入成功後才能導回原本的目的地，而不是每次都固定跳去
            /dashboard。 */}
        <input type="hidden" name="from" value={from} />

        <label className="form-field">
          <span>帳號</span>
          <input
            type="text"
            name="username"
            className="form-input"
            required
            autoComplete="username"
            disabled={isSubmitting}
          />
        </label>

        <label className="form-field">
          <span>密碼</span>
          <input
            type="password"
            name="password"
            className="form-input"
            required
            autoComplete="current-password"
            disabled={isSubmitting}
          />
        </label>

        {actionData?.error && <p className="form-error">{actionData.error}</p>}

        <button type="submit" className="primary-btn" disabled={isSubmitting}>
          {isSubmitting ? '登入中…' : '登入'}
        </button>
      </Form>
    </div>
  )
}

export default LoginPage

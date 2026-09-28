import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { login, selectIsLoggedIn, selectUserError, selectUserStatus } from '../store/userSlice.js'

// LoginPage：跟 Day24 的登入頁不同，今天沒有用 <Form action={loginAction}>，
// 而是回到 Day09 教過的「受控表單 + onSubmit + preventDefault」寫法——
// 因為今天的登入邏輯是 Redux thunk（login），不是路由 action，
// 兩種寫法都合理，差別只在於「非同步流程要不要交給 React Router 管理」。
//
// 登入成功後要導向哪裡：用 useSearchParams 讀出 RequireAuth 導過來時
// 附加的 ?from=，讀不到就預設回首頁。
function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const status = useSelector(selectUserStatus)
  const error = useSelector(selectUserError)

  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo1234')

  const from = searchParams.get('from') || '/'

  useEffect(() => {
    if (isLoggedIn) {
      navigate(from, { replace: true })
    }
  }, [isLoggedIn, navigate, from])

  function handleSubmit(event) {
    event.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <div className="page-inner page-inner--narrow">
      <h1>登入</h1>
      <p className="subtitle">
        測試帳號：<code>demo@example.com</code> / <code>demo1234</code>
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="form-field">
          <span>密碼</span>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-btn" disabled={status === 'loading'}>
          {status === 'loading' ? '登入中…' : '登入'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage

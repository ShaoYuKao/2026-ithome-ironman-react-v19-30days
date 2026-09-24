import { Form, NavLink, useRouteLoaderData } from 'react-router'

// NavBar：登入狀態顯示的核心——直接讀 root 路由 loader 回傳的 { user }，
// 不需要 Context，也不需要自己再打一次 API。
// 登入後：顯示使用者名稱 + 登出按鈕；未登入：顯示登入連結。
function NavBar() {
  const rootData = useRouteLoaderData('root')
  const user = rootData?.user ?? null

  return (
    <nav className="nav-bar">
      <span className="nav-brand">Day24 · Protected Routes Lab</span>
      <ul className="nav-list">
        <li>
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
            首頁
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
          >
            後台 Dashboard
          </NavLink>
        </li>
      </ul>

      <div className="nav-auth">
        {user ? (
          <>
            <span className="nav-user">👤 {user.name}</span>
            {/* method="post" 會呼叫 router.jsx 裡 "/logout" 路由的
                action（logoutAction），而不是單純換頁。action 完成後
                （清空 token 並 redirect('/')），root loader 會自動重新
                執行，這裡的 user 就會變回 null。 */}
            <Form method="post" action="/logout">
              <button type="submit" className="secondary-btn">
                登出
              </button>
            </Form>
          </>
        ) : (
          <NavLink to="/login" className="secondary-btn">
            登入
          </NavLink>
        )}
      </div>
    </nav>
  )
}

export default NavBar

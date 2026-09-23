import { NavLink } from 'react-router'

// 導覽列上每一個連結對應的路由 path 與顯示文字。
const NAV_ITEMS = [
  { to: '/', label: '首頁', end: true },
  { to: '/articles', label: '文章列表' },
]

// NavBar：巢狀在 RootLayout 底下，所有頁面（含 404）都會看到同一份導覽列。
function NavBar() {
  return (
    <nav className="nav-bar">
      <span className="nav-brand">Day23 · Nested Routes Lab</span>
      <ul className="nav-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            {/* "/articles" 這裡刻意不加 end：無論是文章列表 "/articles"
                還是文章詳情 "/articles/1"，都屬於「文章」這個大分類，
                導覽列上維持高亮是合理的行為。 */}
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavBar

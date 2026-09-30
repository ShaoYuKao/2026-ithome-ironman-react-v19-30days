import { NavLink } from 'react-router'

const NAV_ITEMS = [
  { to: '/', label: '首頁', end: true },
  { to: '/about', label: '關於這個專案' },
]

// NavBar：整個 App 只有兩個導覽項目，刻意保持單純——今天的重點是
// 「怎麼把 App 建置、部署出去」，不是再多做幾個路由頁面。
function NavBar() {
  return (
    <nav className="nav-bar">
      <span className="nav-brand">Day30 · 30 天學習展示牆</span>
      <ul className="nav-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
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

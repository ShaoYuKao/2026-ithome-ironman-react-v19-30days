import { NavLink } from 'react-router'

const NAV_ITEMS = [
  { to: '/', label: '首頁', end: true },
  { to: '/articles', label: '文章列表' },
]

// NavBar：跟 Day22/Day23 相同的 <NavLink> 高亮寫法。
function NavBar() {
  return (
    <nav className="nav-bar">
      <span className="nav-brand">Day27 · Redux Articles Lab</span>
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

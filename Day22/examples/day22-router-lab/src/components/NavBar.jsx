import { NavLink } from 'react-router'

// 導覽列上每一個連結對應的路由 path 與顯示文字，之後如果要增加頁面，
// 只需要在這裡加一筆設定，並在 router.jsx 註冊對應的路由即可。
const NAV_ITEMS = [
  { to: '/', label: '首頁', end: true },
  { to: '/window-size', label: 'useWindowSize' },
  { to: '/local-storage', label: 'useLocalStorage' },
  { to: '/debounce', label: 'useDebounce' },
  { to: '/search', label: '商品搜尋' },
]

// NavBar：用 <NavLink> 而不是 <Link>，因為導覽列需要知道「目前在哪一頁」
// 並且加上高亮樣式（active 狀態），這是 NavLink 比 Link 多出來的能力。
function NavBar() {
  return (
    <nav className="nav-bar">
      <span className="nav-brand">Day22 · Hook Router</span>
      <ul className="nav-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            {/* end：只有網址「完全等於」to 才算 active。
                首頁 "/" 一定要加 end，否則因為每個網址都是以 "/" 開頭，
                首頁的連結會永遠被判定成 active，其他頁面反而無法正確高亮。 */}
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

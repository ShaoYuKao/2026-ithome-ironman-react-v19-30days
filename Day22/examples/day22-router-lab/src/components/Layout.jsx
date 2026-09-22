import NavBar from './NavBar.jsx'

// Layout：所有頁面共用的外層結構（導覽列 + 內容區）。
//
// 這裡刻意用最單純的「一般 React children props 組合」來達成每個頁面
// 都看得到同一個 NavBar，並沒有使用 React Router 的巢狀路由（nested
// routes）與 <Outlet />——那是 Day23「巢狀路由與 Layout 元件設計」要
// 學的進階寫法。Day22 先只專心搞懂兩件事：「網址對應頁面元件」，以及
// 「用 <Link>／<NavLink> 在頁面之間導覽」。
function Layout({ children }) {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="page-content">{children}</main>
    </div>
  )
}

export default Layout

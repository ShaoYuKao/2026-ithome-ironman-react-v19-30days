import NavBar from './NavBar.jsx'

// Layout：沿用 Day22 的作法，用最單純的 children props 組合，讓每個頁面
// 都能共用同一個 NavBar（今天的重點是 Redux，不重複 Day23 教過的巢狀路由 / <Outlet />）。
function Layout({ children }) {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="page-content">{children}</main>
    </div>
  )
}

export default Layout

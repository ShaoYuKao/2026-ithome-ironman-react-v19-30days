import NavBar from './NavBar.jsx'

// Layout：沿用 Day22 的做法，用最單純的 children props 組合，
// 讓每個頁面都共用同一個 NavBar，不使用巢狀路由的 <Outlet />。
function Layout({ children }) {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="page-content">{children}</main>
      <footer className="app-footer">
        <p>
          React 30 天入門到進階學習計畫 · Day30 專案整合與部署上線 ·{' '}
          <span className="env-pill">{import.meta.env.MODE}</span>
        </p>
      </footer>
    </div>
  )
}

export default Layout

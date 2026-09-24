import { Outlet } from 'react-router'
import NavBar from './NavBar.jsx'

// RootLayout：延續 Day23 的巢狀路由寫法，導覽列固定在最外層，
// 所有頁面（含登入頁、404）都共用同一個 <Outlet />。
function RootLayout() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout

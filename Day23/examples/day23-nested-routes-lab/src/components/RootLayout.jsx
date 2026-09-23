import { Outlet } from 'react-router'
import NavBar from './NavBar.jsx'

// RootLayout：今天的重點示範之一——用巢狀路由的 <Outlet /> 取代 Day22
// `components/Layout.jsx` 用 children props 手動組合畫面的寫法。
// 兩者畫面結果幾乎一樣（都是「導覽列 + 內容區」），差異在於：
//
// - Day22：router.jsx 裡每一筆路由都要自己寫
//   `{ path: '/xxx', element: <Layout><XxxPage /></Layout> }`，
//   Layout 需要被「呼叫」很多次。
// - Day23：router.jsx 只需要把 RootLayout 放在最外層一次，其餘路由都
//   當作它的 children，React Router 會自動把目前比對到的子路由畫進
//   這裡的 <Outlet /> 位置，不必每筆路由都重複包一次 Layout。
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

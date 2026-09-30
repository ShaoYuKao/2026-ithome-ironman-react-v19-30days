import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import DayDetailPage from './pages/DayDetailPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// router.jsx：跟 Day22 一樣用 createBrowserRouter 描述路由表，
// 但這裡多帶了一個 basename 選項——這是今天新增、跟「部署」直接相關的設定。
//
// basename 告訴 React Router「這個 App 實際上是被放在網址的哪個子路徑下」。
// 一般本機開發（base 為預設值 '/'）時不需要在意這個選項；但部署到 GitHub
// Pages 專案頁時，vite.config.js 會把 base 設成 '/repo名稱/'（見 README
// 第五節），如果 React Router 不知道這件事，使用者點擊 <Link to="/about">
// 時，比對到的網址會變成整個網域下的 "/about"，而不是「repo 名稱子路徑
// 底下的 about」，導覽就會失效。
//
// import.meta.env.BASE_URL 是 Vite 內建的環境變數，值永遠等於
// vite.config.js 設定的 base，兩邊只要維護一份設定就好，不會忘記同步。
export const router = createBrowserRouter(
  [
    { path: '/', element: <Layout><HomePage /></Layout> },
    { path: '/days/:dayNumber', element: <Layout><DayDetailPage /></Layout> },
    { path: '/about', element: <Layout><AboutPage /></Layout> },
    { path: '*', element: <Layout><NotFoundPage /></Layout> },
  ],
  { basename: import.meta.env.BASE_URL },
)

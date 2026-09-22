import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import WindowSizePage from './pages/WindowSizePage.jsx'
import LocalStoragePage from './pages/LocalStoragePage.jsx'
import DebouncePage from './pages/DebouncePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// router.jsx：今天的路由設定檔，用一個「陣列」描述整個網站有哪些網址、
// 各自對應哪個頁面元件——這就是 Data Mode（createBrowserRouter +
// RouterProvider）認識路由的方式，跟 Declarative Mode 用 JSX 寫
// <Routes><Route path="..." element={...} /></Routes> 描述的是同一件事，
// 只是換了一種寫法（詳見本篇 README「兩種建立路由的方式」）。
//
// 每一筆路由的 element 都用 <Layout> 包一層，讓導覽列（NavBar）在
// 每個頁面之間切換時都能持續顯示，不會因為換頁而消失或重新製作。
export const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/window-size', element: <Layout><WindowSizePage /></Layout> },
  { path: '/local-storage', element: <Layout><LocalStoragePage /></Layout> },
  { path: '/debounce', element: <Layout><DebouncePage /></Layout> },
  { path: '/search', element: <Layout><SearchPage /></Layout> },
  // 萬用路由（catch-all）：path 用 "*" 代表「其他都比對不到時的最後防線」。
  // React Router 會依照陣列順序由上而下比對，這一筆必須放在最後面，
  // 否則它會搶先比對成功，讓後面所有路由都變得不會執行。
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
])

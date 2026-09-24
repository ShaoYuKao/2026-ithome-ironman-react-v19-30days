import { createBrowserRouter } from 'react-router'
import RootLayout from './components/RootLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ErrorBoundaryPage from './pages/ErrorBoundaryPage.jsx'
import { loginAction } from './auth/loginAction.js'
import { dashboardLoader } from './auth/dashboardLoader.js'
import { logoutAction } from './auth/logoutAction.js'
import { getAuth } from './auth/authStorage.js'

// 根路由的 loader：回傳目前的登入狀態（{ user } 或 { user: null }），
// 讓 NavBar、RequireAuth 都能透過 useRouteLoaderData('root') 讀到同一份
// 資料，不需要額外的 Context 或全域狀態管理。
//
// 關鍵觀念——為什麼 login / logout 的 action 不用手動同步這裡的資料：
// React Router 的規則是「action 完成後，畫面上所有作用中的 loader 都會
// 自動重新執行一次（revalidate）」。login/logout 的 action 都會導頁到
// 新網址，而 root 路由在任何網址下都會被比對到，所以它的 loader 一定會
// 跟著重新執行，重新讀一次 localStorage，畫面自然就會同步。
function rootLoader() {
  const auth = getAuth()
  return { user: auth?.user ?? null }
}

export const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    loader: rootLoader,
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage />, action: loginAction },
      {
        path: 'dashboard',
        element: (
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        ),
        loader: dashboardLoader,
        // errorElement 只掛在這一層（而不是最外層的 root route）：
        // dashboardLoader 丟出「非 redirect」的例外時（例如後端伺服器
        // 整台打不通），只有 <Outlet /> 這個插槽會換成 ErrorBoundaryPage，
        // RootLayout（含 NavBar）仍會正常顯示——避免整個畫面連導覽列都
        // 消失不見。
        errorElement: <ErrorBoundaryPage />,
      },
      // logout 只有 action、沒有 element：是一個沒有畫面的「資源路由」，
      // 只透過 <Form method="post" action="/logout"> 觸發，永遠不會被
      // GET 導覽到，所以不需要提供 element。
      { path: 'logout', action: logoutAction },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

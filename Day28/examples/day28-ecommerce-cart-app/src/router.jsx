import { createBrowserRouter } from 'react-router'
import RootLayout from './components/RootLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductListPage from './pages/ProductListPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// router.jsx：延續 Day22～Day24 的巢狀路由寫法（RootLayout + <Outlet />）。
//
// 跟 Day24 最大的不同：這裡沒有 root loader，也沒有任何 action——今天的
// 登入狀態、購物車資料全部改放在 Redux store（見 store/store.js），
// store 本身就是路由樹之外的全域單例，不需要靠 loader 把資料「準備好、
// 往下傳」，任何頁面 / 元件都能直接用 useSelector 讀到最新資料。
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:productId', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'checkout',
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

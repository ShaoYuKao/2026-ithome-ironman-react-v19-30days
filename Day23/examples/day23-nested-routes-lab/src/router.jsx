import { createBrowserRouter } from 'react-router'
import RootLayout from './components/RootLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import ArticlesLayout from './pages/ArticlesLayout.jsx'
import ArticlesListPage from './pages/ArticlesListPage.jsx'
import ArticleDetailPage from './pages/ArticleDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// router.jsx：今天的重點——用「巢狀」的 children 陣列描述路由，
// 而不是 Day22 那種每一筆路由都各自獨立、互不隸屬的寫法。
//
// 兩層巢狀結構：
// 1. 最外層 "/"：RootLayout 負責畫導覽列（NavBar），子路由共用同一個
//    <Outlet />，取代 Day22 用 <Layout>{page}</Layout> 手動包每一筆路由的寫法。
// 2. "/articles"：ArticlesLayout 再多包一層「文章分類側欄」，只有文章
//    相關的頁面（列表、詳情）才看得到這個側欄，首頁跟 404 頁面不會有。
//
// index: true 的路由，代表「父層路徑本身」要顯示的內容
// （例如 "/articles" 這個網址，本身要渲染 ArticlesListPage）。
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'articles',
        element: <ArticlesLayout />,
        children: [
          { index: true, element: <ArticlesListPage /> },
          { path: ':articleId', element: <ArticleDetailPage /> },
        ],
      },
      // 萬用路由：因為巢狀在 RootLayout 底下，所以 404 頁面一樣看得到
      // 導覽列，不需要像 Day22 一樣每筆路由都手動包一次 <Layout>。
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

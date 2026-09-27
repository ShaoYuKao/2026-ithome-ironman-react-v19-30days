import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ArticlesPage from './pages/ArticlesPage.jsx'
import ArticleDetailPage from './pages/ArticleDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// router.jsx：沿用 Day22 的簡單寫法（每筆路由各自用 <Layout> 包起來），
// 今天不重複 Day23 教過的巢狀路由，把篇幅留給 Redux 的部分。
export const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/articles', element: <Layout><ArticlesPage /></Layout> },
  { path: '/articles/:articleId', element: <Layout><ArticleDetailPage /></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
])

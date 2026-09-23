import { Outlet } from 'react-router'
import CategorySidebar from '../components/CategorySidebar.jsx'

// ArticlesLayout：巢狀在 RootLayout 底下的「第二層」Layout，只有
// "/articles" 與 "/articles/:articleId" 這兩個子路由會套用到；首頁、
// 404 頁面不會受影響。
//
// 這就是巢狀路由（Nested Routes）的重點：不同層級的路由可以疊出各自
// 需要的共用畫面骨架，而不是整個網站只能有「一層」Layout 可以用。
// CategorySidebar 會一直顯示在文章列表與文章詳情頁面的旁邊，這是透過
// 這一層的 <Outlet /> 達成的，而不是每個頁面自己各畫一次側欄。
function ArticlesLayout() {
  return (
    <div className="page-inner articles-layout">
      <CategorySidebar />
      <div className="articles-main">
        <Outlet />
      </div>
    </div>
  )
}

export default ArticlesLayout

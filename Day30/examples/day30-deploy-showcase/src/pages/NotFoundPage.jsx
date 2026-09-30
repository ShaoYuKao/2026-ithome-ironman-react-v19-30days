import { Link } from 'react-router'

// NotFoundPage：router.jsx 裡 path: '*' 的萬用路由對應的頁面。
function NotFoundPage() {
  return (
    <div className="page-inner">
      <div className="not-found">
        <p className="not-found__code">404</p>
        <h1>找不到這個頁面</h1>
        <p className="subtitle">網址可能打錯了，或這個頁面已經搬家。可以先回首頁看看。</p>
        <Link to="/" className="secondary-btn">
          回首頁
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage

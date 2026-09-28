import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <div className="page-inner not-found">
      <h1>404</h1>
      <p>找不到這個頁面。</p>
      <Link to="/" className="primary-btn">
        回首頁
      </Link>
    </div>
  )
}

export default NotFoundPage

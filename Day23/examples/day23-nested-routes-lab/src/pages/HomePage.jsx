import { Link } from 'react-router'

// HomePage：路由 "/"（RootLayout 的 index 路由）。簡短說明今天的重點，
// 並提供一個進入文章列表的入口。
function HomePage() {
  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">Day 23 練習</p>
        <h1>巢狀路由與動態參數：文章列表 → 文章詳情</h1>
        <p className="subtitle">
          延續 <Link to="/articles">Day22</Link> 的路由基礎，今天示範兩層巢狀路由（RootLayout /
          ArticlesLayout）、<code>&lt;Outlet /&gt;</code>、動態路由參數 <code>useParams</code>
          、程式化導頁 <code>useNavigate</code>，以及查詢字串 <code>useSearchParams</code>。
        </p>
      </header>

      <div className="card-grid">
        <Link to="/articles" className="card link-card">
          <h2>前往文章列表</h2>
          <p className="card-desc">
            瀏覽文章、依分類篩選、輸入關鍵字搜尋，並點擊任一篇文章查看詳情頁（動態路由{' '}
            <code>/articles/:articleId</code>）。
          </p>
        </Link>
      </div>

      <section className="feature-list">
        <h2>今天會用到的路由概念</h2>
        <ul>
          <li>
            <strong>Nested Routes</strong>：把一個路由巢狀在另一個路由底下，共用同一層畫面骨架。
          </li>
          <li>
            <strong>&lt;Outlet /&gt;</strong>：父層路由用來標記「子路由要畫在哪裡」的插槽。
          </li>
          <li>
            <strong>useParams</strong>：讀出網址中的動態參數，例如 <code>/articles/3</code> 裡的{' '}
            <code>3</code>。
          </li>
          <li>
            <strong>useNavigate</strong>：用程式主動換頁，例如「上一篇／下一篇」按鈕。
          </li>
          <li>
            <strong>useSearchParams</strong>：讀寫網址的查詢字串，例如 <code>?category=react</code>。
          </li>
        </ul>
      </section>
    </div>
  )
}

export default HomePage

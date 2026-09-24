import { Link, useRouteLoaderData } from 'react-router'

// HomePage：路由 "/"（RootLayout 的 index 路由）。簡短說明今天的重點，
// 並依登入狀態顯示不同的行動呼籲按鈕。
function HomePage() {
  const rootData = useRouteLoaderData('root')
  const user = rootData?.user ?? null

  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">Day 24 練習</p>
        <h1>React Router：資料載入與保護路由</h1>
        <p className="subtitle">
          延續 Day22／Day23 的 Data Mode 路由基礎，今天示範 <code>loader</code> /{' '}
          <code>action</code> 這兩個 Data API，以及如何用 <code>useEffect</code> + 條件渲染，
          實作一個「未登入就導向登入頁」的路由守衛（Protected Route）。
        </p>
      </header>

      <div className="card-grid">
        {user ? (
          <Link to="/dashboard" className="card link-card">
            <h2>前往 Dashboard</h2>
            <p className="card-desc">
              你目前已登入為「{user.name}」，可以直接進入受保護的後台頁面，
              觀看 loader 載入的個人資料與統計數字。
            </p>
          </Link>
        ) : (
          <Link to="/login" className="card link-card">
            <h2>前往登入頁</h2>
            <p className="card-desc">
              還沒登入嗎？點這裡前往登入頁；如果直接嘗試進入 <code>/dashboard</code>
              ，路由守衛也會自動把你導向這裡。
            </p>
          </Link>
        )}
      </div>

      <section className="feature-list">
        <h2>今天會用到的路由概念</h2>
        <ul>
          <li>
            <strong>loader</strong>：進入頁面「之前」先載入資料，元件渲染時就已經有資料可用，
            不需要再自己寫 <code>useEffect</code> + <code>fetch</code>。
          </li>
          <li>
            <strong>action</strong>：處理表單送出（例如登入），完成後會自動重新整理頁面上所有
            loader 的資料（revalidate）。
          </li>
          <li>
            <strong>redirect()</strong>：在 loader / action 裡拋出或回傳，直接導向另一個網址。
          </li>
          <li>
            <strong>RequireAuth</strong>：用 <code>useEffect</code> + 條件渲染實作的路由守衛元件，
            保護 <code>/dashboard</code> 不被未登入的使用者看到。
          </li>
        </ul>
      </section>
    </div>
  )
}

export default HomePage

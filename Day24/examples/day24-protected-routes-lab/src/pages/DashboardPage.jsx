import { useLoaderData } from 'react-router'

// DashboardPage：受保護頁面本體，外層在 router.jsx 已經包了一層
// <RequireAuth>，這裡只需要專心顯示 loader 準備好的資料即可。
// 實際的 dashboardLoader 定義在 ../auth/dashboardLoader.js（router.jsx
// 會直接從那裡 import 給路由設定用），同樣是為了不讓這個檔案同時
// export 元件與一般函式。
function DashboardPage() {
  const { user, stats } = useLoaderData()

  return (
    <div className="page-inner">
      <header className="page-header page-header--left">
        <p className="eyebrow">受保護頁面</p>
        <h1>歡迎回來，{user.name}</h1>
        <p className="subtitle">
          這裡的資料是 <code>loader</code> 呼叫 <code>GET /api/profile</code>
          （帶著 <code>Authorization</code> header）拿到的，元件渲染時就已經準備好了。
        </p>
      </header>

      <div className="card-grid dashboard-stats">
        <div className="card">
          <span className="badge">身分</span>
          <h2>{user.role}</h2>
          <p className="card-desc">帳號：{user.name}</p>
        </div>
        <div className="card">
          <span className="badge">待辦事項</span>
          <h2>{stats.tasks} 筆</h2>
          <p className="card-desc">今天還有這麼多任務尚未完成。</p>
        </div>
        <div className="card">
          <span className="badge">未讀訊息</span>
          <h2>{stats.messages} 則</h2>
          <p className="card-desc">來自其他成員的訊息通知。</p>
        </div>
      </div>

      <p className="dashboard-hint">
        想測試「token 失效」的保護機制：保持登入狀態，重新啟動 <code>server/</code> 的 Express
        服務後重新整理這個頁面，因為伺服器記憶體裡的 token 清單被清空了，loader 會判定登入已過期，
        自動導回登入頁。
      </p>
    </div>
  )
}

export default DashboardPage

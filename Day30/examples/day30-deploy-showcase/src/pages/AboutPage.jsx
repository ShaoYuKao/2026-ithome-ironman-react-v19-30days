// AboutPage：路由 "/about" 對應的頁面。
//
// 這裡刻意把好幾個 import.meta.env 的值直接印在畫面上，讓「環境變數」
// 不再只是 README 裡的文字說明，而是真的能在瀏覽器裡看到差異：
// 用 `npm run dev` 打開，跟用 `npm run build` + `npm run preview` 打開，
// 「目前模式」「DEV／PROD」這幾欄的值會不一樣（詳見本篇 README 第三節）。
const TECH_STACK = [
  { name: 'React 19', desc: '元件、Hooks、Actions／Suspense 等 React 19 新特性' },
  { name: 'React Router 8', desc: 'createBrowserRouter + RouterProvider 的 Data Mode 路由' },
  { name: 'Vite 8', desc: '開發伺服器（Dev Server）與正式建置（Build）工具' },
  { name: 'oxlint', desc: '靜態分析工具，檢查程式碼裡潛在的錯誤寫法' },
  { name: 'gh-pages', desc: '把 npm run build 產出的 dist/ 推上 GitHub Pages 的 CLI 工具' },
  { name: 'GitHub Actions', desc: '推送程式碼後自動建置並部署的 CI/CD 流程（見 .github/workflows）' },
]

const ENV_ROWS = [
  { label: 'import.meta.env.MODE', value: import.meta.env.MODE, desc: '目前執行模式（development／production）' },
  { label: 'import.meta.env.DEV', value: String(import.meta.env.DEV), desc: '是否為開發模式（dev server）' },
  { label: 'import.meta.env.PROD', value: String(import.meta.env.PROD), desc: '是否為正式建置（build）' },
  { label: 'import.meta.env.BASE_URL', value: import.meta.env.BASE_URL, desc: '對照 vite.config.js 設定的 base 路徑' },
  { label: 'VITE_APP_TITLE', value: import.meta.env.VITE_APP_TITLE, desc: '來自 .env，所有模式共用' },
  {
    label: 'VITE_APP_ENV_LABEL',
    value: import.meta.env.VITE_APP_ENV_LABEL,
    desc: '來自 .env.development／.env.production，兩種模式的值不同',
  },
  { label: 'VITE_GITHUB_REPO_URL', value: import.meta.env.VITE_GITHUB_REPO_URL, desc: '用來組出每日教學文件連結' },
]

function AboutPage() {
  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">關於這個專案</p>
        <h1>Day30｜專案整合與部署上線</h1>
        <p className="subtitle">
          這個頁面示範一份「收尾用」專案 README 該有的三個段落：技術棧、環境變數與建置資訊、學習心得。
        </p>
      </header>

      <section className="card">
        <h2>技術棧</h2>
        <ul className="tech-list">
          {TECH_STACK.map((item) => (
            <li key={item.name}>
              <strong>{item.name}</strong>
              <span className="card-desc">{item.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>環境變數 &amp; 建置資訊（即時讀取，換個指令執行結果會不同）</h2>
        <table className="env-table">
          <thead>
            <tr>
              <th>變數</th>
              <th>目前的值</th>
              <th>說明</th>
            </tr>
          </thead>
          <tbody>
            {ENV_ROWS.map((row) => (
              <tr key={row.label}>
                <td>
                  <code>{row.label}</code>
                </td>
                <td>
                  <code>{String(row.value)}</code>
                </td>
                <td>{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="form-hint">
          用 <code>npm run dev</code> 打開這一頁，再用 <code>npm run build</code> + <code>npm run preview</code>{' '}
          打開一次，比較上表的差異，就能親眼確認「開發模式」跟「正式建置」用的是不同的環境變數值。
        </p>
      </section>

      <section className="card">
        <h2>學習心得（範例）</h2>
        <div className="note-block">
          <p>
            30 天走完 React 的基礎、Hooks、效能優化、路由與 Redux Toolkit
            全域狀態管理，最大的收穫是理解「元件、狀態、副作用」這三個概念是怎麼互相搭配運作的；
            最後這兩天（Day29、Day30）補上測試與部署，才真正體會到「寫得出來」跟「能穩定上線給別人使用」
            中間還有一段距離。建議部署自己的作品時，把這份心得換成自己實際遇到的問題與收穫。
          </p>
        </div>
      </section>
    </div>
  )
}

export default AboutPage

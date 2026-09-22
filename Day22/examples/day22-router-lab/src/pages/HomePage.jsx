import { Link } from 'react-router'

// 首頁上要展示的四張卡片：對應到今天多頁面化之後的四個 Hook 路由頁面。
const HOOK_LINKS = [
  {
    to: '/window-size',
    title: 'useWindowSize',
    desc: '即時偵測瀏覽器視窗尺寸，示範兩個不同元件共用同一個自訂 Hook 的效果。',
  },
  {
    to: '/local-storage',
    title: 'useLocalStorage',
    desc: '把 state 自動同步進 localStorage，重新整理頁面內容依然保留。',
  },
  {
    to: '/debounce',
    title: 'useDebounce',
    desc: '打字停下來一段時間後值才會「安定」下來，體會 Debounce 的行為。',
  },
  {
    to: '/search',
    title: '商品搜尋（Debounce + Fetch）',
    desc: '把 useDebounce 與 useFetch 組合起來，做出不會狂發 API 請求的即時搜尋框。',
  },
]

// HomePage：路由 "/" 對應的首頁，用 <Link> 做出可以點擊前往各個 Hook
// 頁面的卡片——這裡不需要顯示「目前在哪一頁」，所以用 Link 就好，
// 不需要像導覽列那樣使用會判斷 active 狀態的 NavLink。
function HomePage() {
  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">Day 22 練習</p>
        <h1>自訂 Hook 函式庫：多頁面路由版</h1>
        <p className="subtitle">
          延續 Day21 的自訂 Hook 函式庫，把原本疊在同一頁的四個 Demo，
          改成各自獨立的路由頁面，並在上方加上導覽列（NavBar）。
          點選下方任一張卡片，或使用上方導覽列，都可以切換到對應的 Hook 頁面。
        </p>
      </header>

      <div className="card-grid">
        {HOOK_LINKS.map((item) => (
          <Link key={item.to} to={item.to} className="card link-card">
            <h2>{item.title}</h2>
            <p className="card-desc">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage

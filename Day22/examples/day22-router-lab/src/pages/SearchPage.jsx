import CombinedSearchDemo from '../components/CombinedSearchDemo.jsx'

// SearchPage：路由 "/search" 對應的頁面，展示 useDebounce 與 useFetch
// 兩個 Hook 組合使用的商品搜尋框，需要 server/index.js 這支 Express
// 後端一起啟動才能正常運作（見本篇 README「如何在本機執行範例」）。
function SearchPage() {
  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">Hook 路由頁面</p>
        <h1>商品搜尋：useDebounce + useFetch</h1>
        <p className="subtitle">
          延續 Day21 的組合技：<code>useDebounce</code> 負責「打字停下來才觸發搜尋」，
          <code>useFetch</code> 負責串接 Express 後端，兩者搭配起來就是「打字很跟手，
          卻不會對後端狂發請求」的搜尋框。
        </p>
      </header>
      <div className="card-grid">
        <CombinedSearchDemo />
      </div>
    </div>
  )
}

export default SearchPage

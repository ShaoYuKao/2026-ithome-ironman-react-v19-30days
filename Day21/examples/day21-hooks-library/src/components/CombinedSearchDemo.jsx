import { useState } from 'react'
import { useDebounce, useFetch } from '../hooks/index.js'

// CombinedSearchDemo：把 useDebounce 與 useFetch 兩個函式庫裡的 Hook
// 組合起來，做成一個「打字即時搜尋，卻不會對後端狂發請求」的商品搜尋框。
//
// 資料流：
// 1. rawKeyword：使用者每一次按鍵，都會立刻更新（提供「打字很跟手」的體感）。
// 2. debouncedKeyword = useDebounce(rawKeyword, 400)：停止輸入滿 400ms
//    後才會跟上 rawKeyword。
// 3. useFetch(`/api/products?q=${debouncedKeyword}`)：只有在
//    debouncedKeyword 真正改變時，才會產生新的 URL，進而觸發新的請求
//    ——這正是「用 useFetch 現有的 url 依賴機制，順便省下呼叫次數」的效果，
//    完全不需要額外寫任何節流邏輯。
function CombinedSearchDemo() {
  const [rawKeyword, setRawKeyword] = useState('')
  const debouncedKeyword = useDebounce(rawKeyword, 400)
  const [requestCount, setRequestCount] = useState(0)

  const searchUrl = `/api/products?q=${encodeURIComponent(debouncedKeyword)}`
  const { data, error, isLoading, refetch } = useFetch(searchUrl)

  // 用跟 DebounceDemo 一樣的「渲染時比較」寫法，記錄 useFetch 實際送出過
  // 幾次請求（isLoading 從 false 變成 true 的那一刻，代表 requestKey
  // 換了一批、useFetch 內部的 effect 即將真的呼叫一次 fetch）。
  const [wasLoading, setWasLoading] = useState(false)
  if (isLoading && !wasLoading) {
    setWasLoading(true)
    setRequestCount((count) => count + 1)
  } else if (!isLoading && wasLoading) {
    setWasLoading(false)
  }

  return (
    <section className="card">
      <h2>4️⃣ useDebounce + useFetch：不會狂發請求的商品搜尋框</h2>
      <p className="card-desc">
        快速輸入商品關鍵字（例如「鍵盤」「家具」），打開瀏覽器開發者工具的 Network
        分頁（或觀察下方的「實際送出請求次數」），會發現不管打了幾個字，
        真正送到後端的請求次數，遠比按鍵次數少很多——這就是 <code>useDebounce</code>{' '}
        與 <code>useFetch</code> 搭配使用、在真實情境中省下的成本。
      </p>

      <label className="form-label" htmlFor="search-keyword">
        搜尋商品名稱或分類
      </label>
      <input
        id="search-keyword"
        type="text"
        className="form-input"
        value={rawKeyword}
        onChange={(event) => setRawKeyword(event.target.value)}
        placeholder="例如：鍵盤、家具、運動用品"
      />

      <p className="form-hint">
        即時輸入值：<code>{rawKeyword || '（空白）'}</code>　／　實際觸發搜尋的關鍵字：
        <code>{debouncedKeyword || '（空白，顯示全部商品）'}</code>　／　實際送出請求次數：
        <strong>{requestCount}</strong>
      </p>

      {isLoading && <p className="form-hint">🔄 搜尋中……</p>}

      {error && (
        <div className="empty-state">
          <p>❌ 搜尋失敗：{error}</p>
          <button type="button" className="secondary-btn" onClick={refetch}>
            重試
          </button>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          <p className="form-hint">
            共找到 <strong>{data.count}</strong> 項商品
          </p>
          {data.products.length === 0 ? (
            <div className="empty-state">沒有符合「{data.query}」的商品，換個關鍵字試試看。</div>
          ) : (
            <ul className="product-list">
              {data.products.map((product) => (
                <li key={product.id} className="product-item">
                  <span className="product-item__name">{product.name}</span>
                  <span className="badge">{product.category}</span>
                  <span className="product-item__price">NT$ {product.price.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

export default CombinedSearchDemo

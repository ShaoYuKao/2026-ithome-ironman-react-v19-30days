import { useEffect, useState } from 'react'
import { generateProducts } from '../utils/generateProducts.js'
import { SORT_OPTIONS } from '../utils/filterAndSortProducts.js'
import UnoptimizedProductBoard from './UnoptimizedProductBoard.jsx'
import OptimizedProductBoard from './OptimizedProductBoard.jsx'

const PRODUCT_COUNT = 3000

/**
 * 今天的小專案：一個「含大量清單渲染 + 昂貴計算」的頁面，
 * 用同一份資料、同一組操作介面，讓你可以直接切換「優化前」／「優化後」兩種實作，
 * 並肉眼比較兩者的差異。
 */
function MemoCallbackLab() {
  // 惰性初始化（Day04、Day12 都用過）：只有在第一次渲染時，
  // () => generateProducts(PRODUCT_COUNT) 這個函式才會真的被呼叫一次，
  // 之後不管 MemoCallbackLab 重新渲染幾次，都不會重新產生一份新的假資料。
  const [products] = useState(() => generateProducts(PRODUCT_COUNT))
  const [keyword, setKeyword] = useState('')
  const [sortKey, setSortKey] = useState(SORT_OPTIONS[0].value)
  const [optimized, setOptimized] = useState(false)

  // 心跳計時器：每秒讓 MemoCallbackLab 重新渲染一次，模擬「頁面上有其他狀態
  // 也在變化」的真實情境（例如即時時鐘、未讀通知數字、WebSocket 推播的訊息）。
  // 這個 heartbeat 本身跟商品清單完全無關，卻會讓整個 MemoCallbackLab 重新渲染，
  // 進而讓底下的 Board 元件也重新渲染——這正是本章最想凸顯的情境。
  const [heartbeat, setHeartbeat] = useState(0)

  useEffect(() => {
    const timerId = setInterval(() => {
      setHeartbeat((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timerId)
  }, [])

  const Board = optimized ? OptimizedProductBoard : UnoptimizedProductBoard

  return (
    <div className="lab-page">
      <header className="lab-header">
        <p className="eyebrow">Day 15 動手做</p>
        <h1>useMemo 與 useCallback 效能實驗室</h1>
        <p className="subtitle">
          {PRODUCT_COUNT.toLocaleString()} 筆假商品資料、一段刻意設計得很花時間的「推薦分數」計算，
          再加上每秒跳動一次、跟清單完全無關的心跳數字——用來模擬「頁面上同時有其他東西也在變化」的真實情境。
        </p>
      </header>

      <section className="controls-panel">
        <label className="form-field">
          <span className="form-label">搜尋商品名稱／分類</span>
          <input
            type="text"
            className="form-input"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="輸入關鍵字，例如：服飾"
          />
        </label>

        <label className="form-field">
          <span className="form-label">排序方式</span>
          <select
            className="form-input"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="optimize-toggle">
          <input
            type="checkbox"
            checked={optimized}
            onChange={(event) => setOptimized(event.target.checked)}
          />
          <span>啟用效能優化（useMemo + useCallback + React.memo）</span>
        </label>

        <p className="heartbeat">
          💓 心跳：第 <strong>{heartbeat}</strong> 次（每秒 +1，跟商品清單完全無關）
        </p>
      </section>

      <Board products={products} keyword={keyword} sortKey={sortKey} />
    </div>
  )
}

export default MemoCallbackLab

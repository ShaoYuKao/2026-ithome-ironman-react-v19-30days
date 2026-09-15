import { useCallback, useMemo, useRef, useState } from 'react'
import { filterAndSortProducts } from '../utils/filterAndSortProducts.js'
import { MemoProductRow } from './ProductRow.jsx'

const PAGE_SIZE = 20

/**
 * 「優化」版本。跟 UnoptimizedProductBoard 對照，只有三個地方不一樣，
 * 其餘程式碼（包含 JSX 結構）完全相同：
 *
 * 1. useMemo 快取 filterAndSortProducts 的結果：依賴陣列只列出
 *    [products, keyword, sortKey]，代表「不管 OptimizedProductBoard
 *    因為其他原因（例如父層心跳）重新渲染幾次，只要這三個值沒變，
 *    就不會重新執行那段昂貴計算」。
 * 2. useCallback 快取 handleToggleSelect：依賴陣列是空的 []，
 *    因為函式內只用到 setSelectedIds——React 保證 useState 回傳的
 *    setter 函式參照永遠穩定，所以這個回呼函式也永遠回傳同一個參照。
 * 3. ProductRow 換成用 React.memo 包過的 MemoProductRow：
 *    只要傳入的 props 淺層比較（Object.is）全部相同，就直接跳過這個元件的重新渲染。
 */
function OptimizedProductBoard({ products, keyword, sortKey }) {
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const computeCountRef = useRef(0)

  const { list, duration } = useMemo(() => {
    computeCountRef.current += 1
    return filterAndSortProducts(products, keyword, sortKey)
  }, [products, keyword, sortKey])

  // list 本身已經被 useMemo 快取，這裡再用 useMemo 包一層 slice，
  // 確保「心跳造成的重新渲染」不會因為 slice() 產生新陣列參照，
  // 而讓 pageItems 裡每個 product 物件的參照跟著被視為「變了」。
  const pageItems = useMemo(() => list.slice(0, PAGE_SIZE), [list])

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return (
    <div className="product-board">
      <p className="board-meta">
        本次計算花費 <strong>{duration.toFixed(1)} ms</strong>　·　
        已執行 <strong>{computeCountRef.current}</strong> 次運算　·　
        共 {list.length.toLocaleString()} 筆符合（僅顯示前 {PAGE_SIZE} 筆）
      </p>
      <ul className="product-list">
        {pageItems.map((product, index) => (
          <MemoProductRow
            key={product.id}
            product={product}
            isSelected={selectedIds.has(product.id)}
            onToggleSelect={handleToggleSelect}
            showRenderBadge={index === 0}
          />
        ))}
      </ul>
    </div>
  )
}

export default OptimizedProductBoard

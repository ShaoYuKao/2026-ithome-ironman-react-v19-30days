import { useRef, useState } from 'react'
import { filterAndSortProducts } from '../utils/filterAndSortProducts.js'
import { ProductRow } from './ProductRow.jsx'

const PAGE_SIZE = 20

/**
 * 「未優化」版本，故意寫成大多數初學者第一次做這種頁面時最直覺的寫法：
 *
 * 1. 沒有 useMemo：每次這個元件重新渲染，都會重新呼叫一次 filterAndSortProducts，
 *    不管 keyword、sortKey 這兩個「真正會影響結果」的值到底有沒有改變。
 * 2. handleToggleSelect 是一個「每次渲染都重新建立」的一般函式，沒有用 useCallback 包住。
 * 3. ProductRow 是「原始版本」，沒有用 React.memo 包起來，
 *    父層只要重新渲染，所有列都會跟著重新渲染。
 *
 * 跟 OptimizedProductBoard 對照著看，會發現兩個檔案的 JSX 結構幾乎一模一樣，
 * 差異全部集中在這三個地方。
 */
function UnoptimizedProductBoard({ products, keyword, sortKey }) {
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const computeCountRef = useRef(0)

  // 👇 沒有快取：這一行只要元件重新渲染就會執行一次，
  // 即使呼叫的原因只是「心跳每秒 +1」這種跟商品清單完全無關的更新。
  const { list, duration } = filterAndSortProducts(products, keyword, sortKey)
  computeCountRef.current += 1

  const pageItems = list.slice(0, PAGE_SIZE)

  // 👇 沒有快取：每次渲染都會建立一個全新的函式參照，
  // 即使 ProductRow 有機會用 React.memo 包起來，這個新參照也會讓 memo 的比較永遠失敗。
  function handleToggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="product-board">
      <p className="board-meta">
        本次計算花費 <strong>{duration.toFixed(1)} ms</strong>　·　
        已執行 <strong>{computeCountRef.current}</strong> 次運算　·　
        共 {list.length.toLocaleString()} 筆符合（僅顯示前 {PAGE_SIZE} 筆）
      </p>
      <ul className="product-list">
        {pageItems.map((product, index) => (
          <ProductRow
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

export default UnoptimizedProductBoard

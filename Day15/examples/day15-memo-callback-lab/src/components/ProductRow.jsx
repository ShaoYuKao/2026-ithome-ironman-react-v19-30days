import { memo, useRef } from 'react'

/**
 * 單一商品列。這個檔案同時匯出「原始版本」`ProductRow` 與「用 memo 包過的版本」
 * `MemoProductRow`——兩者的 JSX、邏輯完全相同，唯一差異只有要不要套用 React.memo，
 * 方便在 UnoptimizedProductBoard／OptimizedProductBoard 裡直接替換使用，
 * 也方便你直接對照「同一個元件，包了 memo 前後差在哪裡」。
 *
 * showRenderBadge 只會由父層在「排序後的第一列」設為 true，
 * 用 Day10 學過的「useRef 記錄 render 次數」手法，把這個元件到底被
 * 重新渲染了幾次「畫出來」——這是本章最重要的觀察指標。
 */
function ProductRow({ product, isSelected, onToggleSelect, showRenderBadge }) {
  // 跟 Day10 的 RenderCountDemo 完全一樣的手法：renderCountRef.current 在「渲染期間」
  // 直接遞增並讀取，不透過 useState，所以更新它本身不會多觸發一次渲染。
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  return (
    <li className={isSelected ? 'product-row product-row--selected' : 'product-row'}>
      <button
        type="button"
        className="product-row__select-btn"
        onClick={() => onToggleSelect(product.id)}
        aria-pressed={isSelected}
        aria-label={isSelected ? '取消收藏' : '收藏此商品'}
      >
        {isSelected ? '★' : '☆'}
      </button>
      <span className="product-row__name">{product.name}</span>
      <span className="product-row__category">{product.category}</span>
      <span className="product-row__price">NT$ {product.price.toFixed(0)}</span>
      <span className="product-row__stock">庫存 {product.stock}</span>
      {showRenderBadge && (
        <span
          className="render-badge"
          title="這一列從掛載到現在，元件函式總共被重新執行過幾次"
        >
          🔄 已重新渲染 {renderCountRef.current} 次
        </span>
      )}
    </li>
  )
}

const MemoProductRow = memo(ProductRow)

export { ProductRow, MemoProductRow }

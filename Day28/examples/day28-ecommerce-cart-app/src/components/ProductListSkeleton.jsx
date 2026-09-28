/**
 * loading 狀態時顯示的商品卡片骨架，做法對照 Day27 的 ArticleListSkeleton：
 * 用幾張「長得像商品卡片」的灰色方塊，取代單純的「載入中...」文字。
 */
function ProductListSkeleton({ count = 4 }) {
  return (
    <div className="product-grid" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="product-card product-card--skeleton">
          <div className="skeleton-block skeleton-block--image" />
          <div className="skeleton-block skeleton-block--line skeleton-block--w80" />
          <div className="skeleton-block skeleton-block--line skeleton-block--w60" />
        </div>
      ))}
    </div>
  )
}

export default ProductListSkeleton

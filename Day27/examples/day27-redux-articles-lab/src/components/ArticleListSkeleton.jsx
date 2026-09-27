/**
 * loading 狀態時顯示的骨架（skeleton）畫面，跟 Day20 完全相同的做法：
 * 用幾張「長得像文章卡片」的灰色方塊，取代單純的「載入中...」文字。
 */
function ArticleListSkeleton({ count = 4 }) {
  return (
    <ul className="article-list" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="article-card article-card--skeleton">
          <div className="skeleton-block skeleton-block--badge" />
          <div className="skeleton-block skeleton-block--line skeleton-block--w80" />
          <div className="skeleton-block skeleton-block--line skeleton-block--w100" />
          <div className="skeleton-block skeleton-block--line skeleton-block--w60" />
        </li>
      ))}
    </ul>
  )
}

export default ArticleListSkeleton

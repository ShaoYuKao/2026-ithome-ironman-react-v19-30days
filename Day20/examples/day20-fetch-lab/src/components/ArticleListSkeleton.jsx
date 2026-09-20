/**
 * loading 狀態時顯示的骨架（skeleton）畫面：用幾張「長得像文章卡片」的
 * 灰色方塊，取代單純的「載入中...」文字，讓使用者預期畫面之後的排版，
 * 也讓「骨架換成真正內容」那一刻不會跳動太多。
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

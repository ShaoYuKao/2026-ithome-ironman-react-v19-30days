/**
 * Suspense 的 fallback 畫面：用簡單的骨架（skeleton）取代單純的「載入中...」
 * 文字，寬度特意跟 UserCard 的實際排版相近，讓「fallback 換成真正內容」的
 * 那一瞬間畫面不會跳動太多。
 */
function UserCardSkeleton() {
  return (
    <div className="user-card user-card--skeleton" aria-busy="true" aria-live="polite">
      <div className="skeleton-block skeleton-block--avatar" />
      <div className="user-card__body">
        <div className="skeleton-block skeleton-block--line skeleton-block--w60" />
        <div className="skeleton-block skeleton-block--line skeleton-block--w40" />
        <div className="skeleton-block skeleton-block--line skeleton-block--w90" />
        <div className="skeleton-block skeleton-block--line skeleton-block--w70" />
      </div>
    </div>
  )
}

export default UserCardSkeleton

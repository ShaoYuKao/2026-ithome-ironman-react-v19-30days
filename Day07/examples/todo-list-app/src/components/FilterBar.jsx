function FilterBar({
  filter,
  onChangeFilter,
  remainingCount,
  completedCount,
  onClearCompleted,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-buttons">
        {/* 三元運算子（Day06）：依目前的 filter 決定要不要加上 --active 樣式 */}
        <button
          type="button"
          className={filter === 'all' ? 'filter-btn filter-btn--active' : 'filter-btn'}
          onClick={() => onChangeFilter('all')}
        >
          全部
        </button>
        <button
          type="button"
          className={filter === 'active' ? 'filter-btn filter-btn--active' : 'filter-btn'}
          onClick={() => onChangeFilter('active')}
        >
          未完成
        </button>
        <button
          type="button"
          className={filter === 'completed' ? 'filter-btn filter-btn--active' : 'filter-btn'}
          onClick={() => onChangeFilter('completed')}
        >
          已完成
        </button>
      </div>

      {/*
        三元運算子（而不是用 `remainingCount && ...`，Day06 提過的陷阱）：
        remainingCount 是數字，當它是 0 時，`0 && <p>...</p>` 會讓 React 把 0 當成
        「有效的渲染內容」直接印出畫面上的數字 0，而不是什麼都不顯示。
      */}
      {remainingCount > 0 ? (
        <p className="filter-summary">還有 {remainingCount} 項待完成</p>
      ) : (
        <p className="filter-summary">🎉 全部完成了！</p>
      )}

      {/* && 寫法（Day06）：只有存在已完成項目時，才顯示「清除已完成」按鈕 */}
      {completedCount > 0 && (
        <button type="button" className="todo-clear-btn" onClick={onClearCompleted}>
          清除已完成（{completedCount}）
        </button>
      )}
    </div>
  )
}

export default FilterBar

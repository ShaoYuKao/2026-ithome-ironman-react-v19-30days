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

      {remainingCount > 0 ? (
        <p className="filter-summary">還有 {remainingCount} 項待完成</p>
      ) : (
        <p className="filter-summary">🎉 全部完成了！</p>
      )}

      {completedCount > 0 && (
        <button type="button" className="todo-clear-btn" onClick={onClearCompleted}>
          清除已完成（{completedCount}）
        </button>
      )}
    </div>
  )
}

export default FilterBar

// TaskFilterBar：對照 Day07／Day12 的 FilterBar，篩選按鈕的寫法完全相同，
// 只是這裡的 onChangeFilter 呼叫的是 TasksPanel 裡的 setFilter（純 useState），
// 而不是 dispatch——因為 filter 屬於「畫面狀態」，不是要持久化的「資料狀態」。
function TaskFilterBar({ filter, onChangeFilter, remainingCount, completedCount, onClearCompleted }) {
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
        <button type="button" className="clear-btn" onClick={onClearCompleted}>
          清除已完成（{completedCount}）
        </button>
      )}
    </div>
  )
}

export default TaskFilterBar

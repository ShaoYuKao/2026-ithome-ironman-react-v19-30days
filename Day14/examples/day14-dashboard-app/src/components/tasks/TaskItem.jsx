const PRIORITY_LABEL = { low: '低', medium: '中', high: '高' }

// TaskItem：單一任務列——checkbox 切換完成（Day05 事件處理 + Day06 條件式 className），
// 優先度用小徽章顯示，刪除按鈕呼叫父層傳進來的 onDelete。
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={task.completed ? 'item-row item-row--completed' : 'item-row'}>
      <label className="item-checkbox-label">
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
        <span className="item-title">{task.title}</span>
      </label>
      <span className={`priority-badge priority-badge--${task.priority}`}>
        {PRIORITY_LABEL[task.priority]}
      </span>
      <button type="button" className="delete-btn" onClick={() => onDelete(task.id)}>
        刪除
      </button>
    </li>
  )
}

export default TaskItem

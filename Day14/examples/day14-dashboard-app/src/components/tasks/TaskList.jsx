import TaskItem from './TaskItem.jsx'

// TaskList：跟 Day06／Day07 相同的「提早 return + .map() + key」列表渲染組合。
function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return <p className="empty-hint">目前這個篩選條件下沒有任務。</p>
  }

  return (
    <ul className="item-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}

export default TaskList

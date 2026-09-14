import { useState } from 'react'
import { FILTERS } from '../../reducers/dashboardReducer.js'
import TaskForm from './TaskForm.jsx'
import TaskFilterBar from './TaskFilterBar.jsx'
import TaskList from './TaskList.jsx'

// TasksPanel：任務分頁的「小型父元件」，本身不直接碰 localStorage 或 dashboardReducer 的細節，
// 只負責把 tasks 資料、以及各種 dispatch 呼叫，組裝成 TaskForm / TaskFilterBar / TaskList
// 三個子元件需要的 props——跟 Day07 TodoApp 的角色完全一樣。
//
// filter 是「只有這個分頁自己在乎」的畫面狀態（不影響其他分頁、也不需要重新整理後還記得），
// 所以維持用最單純的 useState，不需要放進 Context，也不需要放進 dashboardReducer。
function TasksPanel({ tasks, dispatch }) {
  const [filter, setFilter] = useState('all')

  const visibleTasks = tasks.filter(FILTERS[filter])
  const remainingCount = tasks.filter((task) => !task.completed).length
  const completedCount = tasks.length - remainingCount

  return (
    <div className="tab-content">
      <TaskForm onAdd={(title, priority) => dispatch({ type: 'tasks/add', payload: { title, priority } })} />
      <TaskFilterBar
        filter={filter}
        onChangeFilter={setFilter}
        remainingCount={remainingCount}
        completedCount={completedCount}
        onClearCompleted={() => dispatch({ type: 'tasks/clearCompleted' })}
      />
      <TaskList
        tasks={visibleTasks}
        onToggle={(id) => dispatch({ type: 'tasks/toggle', payload: { id } })}
        onDelete={(id) => dispatch({ type: 'tasks/delete', payload: { id } })}
      />
    </div>
  )
}

export default TasksPanel

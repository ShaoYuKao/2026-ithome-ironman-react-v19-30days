import { useEffect, useReducer } from 'react'
import TodoInput from './TodoInput.jsx'
import TodoList from './TodoList.jsx'
import FilterBar from './FilterBar.jsx'
import { FILTERS, initTodoState, todoReducer } from '../reducers/todoReducer.js'
import { saveTodos } from '../utils/storage.js'

// TodoApp：Day07 待辦清單的 useReducer 重構版本。
//
// 跟 Day07 版本對照，這裡有兩個關鍵差異：
// 1. 原本的 const [todos, setTodos] = useState(...) 與 const [filter, setFilter] = useState('all')
//    兩個獨立的 useState，合併成一個 useReducer：
//    const [state, dispatch] = useReducer(todoReducer, undefined, initTodoState)
//    state 內部同時包含 { todos, filter }，所有更新都透過 dispatch 一個 action 物件完成，
//    不再有五個各自獨立的 handleXxx 函式各自呼叫 setTodos / setFilter。
// 2. 原本 Day07 手動在 updateTodos 裡「呼叫 setTodos 的同時，也呼叫 saveTodos 寫回 localStorage」，
//    今天已經在 Day08 學過 useEffect，所以改用 Day07 README 結尾預告過的寫法：
//    用一個 useEffect 集中監看 state.todos，只要它改變就自動同步寫入 localStorage，
//    不需要每個 dispatch 呼叫端都「記得」手動處理儲存這件事。
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, undefined, initTodoState)
  const { todos, filter } = state

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const visibleTodos = todos.filter(FILTERS[filter])
  const remainingCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.length - remainingCount

  return (
    <section className="card todo-card">
      <h2>📝 待辦清單（useReducer 重構版）</h2>
      <p className="card-desc">
        跟 Day07 的待辦清單功能完全相同（新增、刪除、標記完成、依完成狀態篩選、清除已完成、
        同步到 <code>localStorage</code>），但內部的狀態管理全部改用 <code>useReducer</code>：
        所有操作都變成 <code>dispatch({'{'} type, payload {'}'})</code>，實際的更新邏輯集中寫在
        <code>src/reducers/todoReducer.js</code> 裡的同一個純函式中。
      </p>

      <TodoInput onAdd={(text) => dispatch({ type: 'todos/add', payload: { text } })} />
      <FilterBar
        filter={filter}
        onChangeFilter={(nextFilter) =>
          dispatch({ type: 'filter/change', payload: { filter: nextFilter } })
        }
        remainingCount={remainingCount}
        completedCount={completedCount}
        onClearCompleted={() => dispatch({ type: 'todos/clearCompleted' })}
      />
      <TodoList
        todos={visibleTodos}
        onToggle={(id) => dispatch({ type: 'todos/toggle', payload: { id } })}
        onDelete={(id) => dispatch({ type: 'todos/delete', payload: { id } })}
      />
    </section>
  )
}

export default TodoApp

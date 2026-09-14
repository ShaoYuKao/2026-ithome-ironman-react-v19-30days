import { loadDashboardState } from '../utils/storage.js'

// FILTERS：跟 Day07、Day12 一樣，把「篩選條件」對應成純函式，
// 只用在任務分頁（tasks），聯絡人與筆記目前不需要篩選。
export const FILTERS = {
  all: () => true,
  active: (task) => !task.completed,
  completed: (task) => task.completed,
}

// initDashboardState：useReducer 的第三個參數（Lazy Initializer，對照 Day12），
// 只在元件掛載時執行一次，用來讀取（比較貴的）localStorage 初始資料。
export function initDashboardState() {
  return loadDashboardState()
}

// dashboardReducer：整個 Dashboard 唯一的「修改資料」入口。
// 跟 Day12 的 todoReducer 相同精神——把所有「tasks / contacts / notes 可能發生的變化」
// 都收斂在這個純函式裡，元件只需要 dispatch({ type, payload })，
// 不需要知道實際的更新邏輯怎麼寫，也不會有好幾個 setState 各自為政、彼此不同步的問題。
export function dashboardReducer(state, action) {
  switch (action.type) {
    // ------- 任務（tasks）-------
    case 'tasks/add': {
      const title = action.payload.title.trim()
      if (title === '') {
        return state
      }
      const newTask = {
        id: crypto.randomUUID(),
        title,
        priority: action.payload.priority,
        completed: false,
      }
      return { ...state, tasks: [...state.tasks, newTask] }
    }

    case 'tasks/toggle': {
      const { id } = action.payload
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        ),
      }
    }

    case 'tasks/delete': {
      const { id } = action.payload
      return { ...state, tasks: state.tasks.filter((task) => task.id !== id) }
    }

    case 'tasks/clearCompleted':
      return { ...state, tasks: state.tasks.filter((task) => !task.completed) }

    // ------- 聯絡人（contacts）-------
    case 'contacts/add': {
      const name = action.payload.name.trim()
      if (name === '') {
        return state
      }
      const newContact = {
        id: crypto.randomUUID(),
        name,
        email: action.payload.email.trim(),
        phone: action.payload.phone.trim(),
      }
      return { ...state, contacts: [...state.contacts, newContact] }
    }

    case 'contacts/delete': {
      const { id } = action.payload
      return { ...state, contacts: state.contacts.filter((contact) => contact.id !== id) }
    }

    // ------- 筆記（notes）-------
    case 'notes/add': {
      const title = action.payload.title.trim()
      if (title === '') {
        return state
      }
      const newNote = {
        id: crypto.randomUUID(),
        title,
        content: action.payload.content.trim(),
        createdAt: new Date().toISOString(),
      }
      return { ...state, notes: [...state.notes, newNote] }
    }

    case 'notes/delete': {
      const { id } = action.payload
      return { ...state, notes: state.notes.filter((note) => note.id !== id) }
    }

    default:
      throw new Error(`dashboardReducer 收到未知的 action type：${action.type}`)
  }
}

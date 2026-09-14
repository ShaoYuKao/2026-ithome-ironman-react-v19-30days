import { useTab } from '../contexts/TabContext.jsx'
import TasksPanel from './tasks/TasksPanel.jsx'
import ContactsPanel from './contacts/ContactsPanel.jsx'
import NotesPanel from './notes/NotesPanel.jsx'

// TabPanel：依照 Context 裡的 activeTab，決定要渲染哪一個分頁面板。
// state、dispatch 是從 DashboardApp 透過 props 往下傳進來的（資料狀態，不放 Context），
// 這裡再依照分頁類型，把對應的那一小份資料（tasks / contacts / notes）與 dispatch
// 繼續往下傳給真正的面板元件——這就是 Day07 學過的「資料往下傳，事件往上回報」。
function TabPanel({ state, dispatch }) {
  const { activeTab } = useTab()

  switch (activeTab) {
    case 'tasks':
      return <TasksPanel tasks={state.tasks} dispatch={dispatch} />
    case 'contacts':
      return <ContactsPanel contacts={state.contacts} dispatch={dispatch} />
    case 'notes':
      return <NotesPanel notes={state.notes} dispatch={dispatch} />
    default:
      // 理論上 activeTab 一定會是 TABS 裡的其中一個值，這裡只是防呆用的提早 return（Day06）。
      return null
  }
}

export default TabPanel

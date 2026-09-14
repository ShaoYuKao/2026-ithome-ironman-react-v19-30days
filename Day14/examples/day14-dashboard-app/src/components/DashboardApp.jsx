import { useEffect, useReducer } from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { dashboardReducer, initDashboardState } from '../reducers/dashboardReducer.js'
import { saveDashboardState } from '../utils/storage.js'
import Header from './Header.jsx'
import SummaryStats from './SummaryStats.jsx'
import TabBar from './TabBar.jsx'
import TabPanel from './TabPanel.jsx'

// DashboardApp：整個小專案「資料狀態」真正集中管理的地方，對照 Day07 的「狀態提升」——
// tasks / contacts / notes 這三份資料，Header、SummaryStats、TabBar 都用不到，
// 只有 TabPanel（以及它底下的三個分頁面板）需要，所以不放進 Context，
// 改用最直覺的「props 往下傳、事件（dispatch）往上回報」方式交給 TabPanel。
//
// 跟 Day12 的 TodoApp 相同做法：useReducer 搭配 Lazy Initializer 從 localStorage 讀取初始資料，
// 再用一個 useEffect 集中監看 state，只要它改變就自動同步寫回 localStorage。
function DashboardApp() {
  const { theme } = useTheme()
  const [state, dispatch] = useReducer(dashboardReducer, undefined, initDashboardState)

  useEffect(() => {
    saveDashboardState(state)
  }, [state])

  return (
    // data-theme 屬性掛在最外層容器上，App.css 裡的 CSS 選擇器 [data-theme='dark']
    // 會依此切換整個頁面的配色，這就是「一個 Context 狀態，牽動一整棵子樹外觀」的具體展示。
    <div className="dashboard-page" data-theme={theme}>
      <Header />
      <main className="dashboard-main">
        <SummaryStats tasks={state.tasks} contacts={state.contacts} notes={state.notes} />
        <section className="dashboard-panel card">
          <TabBar />
          <TabPanel state={state} dispatch={dispatch} />
        </section>
      </main>
    </div>
  )
}

export default DashboardApp

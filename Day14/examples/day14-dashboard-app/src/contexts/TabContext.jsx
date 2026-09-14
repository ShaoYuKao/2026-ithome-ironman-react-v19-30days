import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { TABS } from '../constants/tabs.js'

// TabContext：解決「目前選到哪個分頁」這份資料的 Props Drilling 問題。
// Header、TabBar、TabPanel 分屬元件樹上不同分支，如果單純用 props 一層層往下傳，
// 中間會經過好幾層完全不關心「目前是哪個分頁」的元件（例如 DashboardApp 本身）。
// 用 Context 之後，任何需要知道/修改 activeTab 的元件都能直接呼叫 useTab()。
const TabContext = createContext(null)

function TabProvider({ children }) {
  // 同樣用 useLocalStorage 持久化：重新整理頁面後，會繼續停留在上次瀏覽的分頁，
  // 而不是每次都被重設回第一個分頁。
  const [activeTab, setActiveTab] = useLocalStorage('day14-active-tab', TABS[0].id)

  const value = { activeTab, setActiveTab }

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}

function useTab() {
  const context = useContext(TabContext)
  if (context === null) {
    throw new Error('useTab 必須在 <TabProvider> 內使用')
  }
  return context
}

export { TabProvider, useTab } // eslint-disable-line react/only-export-components -- Provider 與其搭配的自訂 Hook 刻意放在同一檔案，方便對照學習

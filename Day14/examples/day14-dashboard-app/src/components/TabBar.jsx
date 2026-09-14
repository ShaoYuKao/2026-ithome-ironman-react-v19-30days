import { useTab } from '../contexts/TabContext.jsx'
import { useWindowSize } from '../hooks/useWindowSize.js'
import { TABS } from '../constants/tabs.js'

// TabBar：分頁切換的核心 UI。
// - activeTab / setActiveTab 來自 useTab()（Context），不需要靠 props 從 DashboardApp 傳下來。
// - width 來自 useWindowSize()（自訂 Hook）：視窗夠寬時圖示 + 文字並排；
//   視窗窄於 480px（例如手機直式畫面）時，只顯示圖示，避免文字把按鈕撐得太寬而換行擠壓版面。
function TabBar() {
  const { activeTab, setActiveTab } = useTab()
  const { width } = useWindowSize()
  const isCompact = width < 480

  return (
    <div className="tab-bar" role="tablist" aria-label="儀表板分頁">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={
            activeTab === tab.id ? 'tab-btn tab-btn--active' : 'tab-btn'
          }
          onClick={() => setActiveTab(tab.id)}
        >
          <span aria-hidden="true">{tab.icon}</span>
          {!isCompact && <span>{tab.label}</span>}
        </button>
      ))}
    </div>
  )
}

export default TabBar

import ThemeToggleButton from './ThemeToggleButton.jsx'

// Header：跟主題（theme）唯一有關係的地方只有 <ThemeToggleButton />，
// Header 本身完全不需要知道目前是亮色還是暗色，也不需要接收任何跟 theme 有關的 props。
function Header() {
  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">Day 14 週複習與小專案</p>
        <h1>多分頁資料切換 App</h1>
        <p className="subtitle">
          整合 Context（主題／分頁狀態）、useReducer（任務／聯絡人／筆記資料）、
          自訂 Hook（<code>useLocalStorage</code>、<code>useWindowSize</code>）與表單驗證，
          做成一個具備分頁切換、新增資料、深色模式切換的小型儀表板。
        </p>
      </div>
      <ThemeToggleButton />
    </header>
  )
}

export default Header

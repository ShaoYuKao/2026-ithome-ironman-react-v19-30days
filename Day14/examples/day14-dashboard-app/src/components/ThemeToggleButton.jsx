import { useTheme } from '../contexts/ThemeContext.jsx'

// ThemeToggleButton：對照 Day11 的 ThemeToggleDemo——不管這個按鈕實際被放在
// 元件樹的哪個位置，只要呼叫 useTheme()，就能直接拿到目前的 theme 與切換方法，
// 不需要任何人把 theme 當成 props 一路傳進來。
function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
      {theme === 'light' ? '🌞 亮色模式' : '🌙 暗色模式'}
    </button>
  )
}

export default ThemeToggleButton

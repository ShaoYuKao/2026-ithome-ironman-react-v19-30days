import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

// 對照 Day11 的 ThemeContext：createContext 建立一個「置物櫃」，
// 沒有 Provider 包裹時 useContext 會讀到這裡設定的 null 預設值。
const ThemeContext = createContext(null)

// ThemeProvider：跟 Day11 的差異只有一個地方——
// Day11 用 useState('light') 開局永遠是亮色；
// 今天改用 Day13 做好的 useLocalStorage('day14-theme', 'light')，
// 讓「使用者上次選的主題」在重新整理頁面後仍然記得，不會每次都跳回亮色。
function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('day14-theme', 'light')

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const value = { theme, toggleTheme }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// useTheme：把 useContext(ThemeContext) 包裝成自訂 Hook，並加上防呆檢查，
// 避免元件不小心在 <ThemeProvider> 範圍之外使用卻拿到 null 也不自知（沿用 Day11 的做法）。
function useTheme() {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme 必須在 <ThemeProvider> 內使用')
  }
  return context
}

export { ThemeProvider, useTheme } // eslint-disable-line react/only-export-components -- Provider 與其搭配的自訂 Hook 刻意放在同一檔案，方便對照學習

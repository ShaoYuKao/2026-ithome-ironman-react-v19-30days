import { createContext, useContext, useState } from 'react'

// 1. createContext：建立一個「置物櫃」，一開始沒有任何 Provider 包裹時，
//    useContext 讀到的預設值就是這裡傳入的 null。
//    這個預設值只會在「元件樹上完全找不到對應的 Provider」時才會被用到，
//    平常我們一定會用 <ThemeProvider> 包起來，所以幾乎不會真的讀到 null。
const ThemeContext = createContext(null)

// 2. ThemeProvider：真正持有 theme 狀態，並透過 <ThemeContext.Provider value={...}>
//    把資料「放進置物櫃」，包在裡面的所有子孫元件（不管隔了幾層）都能取用。
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // value 就是「放進置物櫃的東西」：把目前的 theme 與切換方法包成一個物件，
  // 子孫元件不管隔了幾層，都能透過 useTheme() 直接拿到這兩樣東西。
  // （這裡先用最直覺的物件字面值寫法即可；如何用 useMemo 快取這個物件、
  // 避免不必要的重新渲染，是 Day15 效能優化才會學到的進階技巧，現階段不需要煩惱。）
  const value = { theme, toggleTheme }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// 3. useTheme：把 useContext(ThemeContext) 包裝成一個自訂 Hook，
//    好處有兩個：(1) 使用端不需要知道 ThemeContext 這個變數的存在，只要 import useTheme；
//    (2) 可以順手加上「有沒有包在 Provider 裡面」的防呆檢查，
//    避免元件不小心在 <ThemeProvider> 範圍之外使用，卻拿到 null 也不自知。
function useTheme() {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme 必須在 <ThemeProvider> 內使用')
  }
  return context
}

export { ThemeProvider, useTheme } // eslint-disable-line react/only-export-components -- Provider 與其搭配的自訂 Hook 刻意放在同一檔案，方便對照學習

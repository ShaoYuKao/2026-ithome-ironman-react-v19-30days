// useLocalStorage：延續 Day13 抽出的自訂 Hook，把「用 useState 讀取初始值、
// 用 useEffect 同步寫回 localStorage」這一整套邏輯包成可重複使用的函式。
//
// 今天（Day14）用它來保存兩個「跟畫面顯示有關、但使用者會希望重新整理後還記得」的狀態：
// 目前的主題（亮色/暗色）與目前選取的分頁（Tab），讓 ThemeContext、TabContext
// 都能用同一份實作完成「有 Context 共享 + 有 localStorage 持久化」兩件事。
import { useEffect, useState } from 'react'

function readStoredValue(key, initialValue) {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : initialValue
  } catch (error) {
    console.error(`讀取 localStorage key="${key}" 失敗，改用預設值啟動：`, error)
    return initialValue
  }
}

export function useLocalStorage(key, initialValue) {
  // Lazy Initializer（Day04）：只有元件掛載的第一次渲染，才會真的讀一次 localStorage。
  const [value, setValue] = useState(() => readStoredValue(key, initialValue))

  // 對照 Day08：只要 value 改變，就自動同步寫回 localStorage，呼叫端不需要自己再寫一次。
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`寫入 localStorage key="${key}" 失敗：`, error)
    }
  }, [key, value])

  return [value, setValue]
}

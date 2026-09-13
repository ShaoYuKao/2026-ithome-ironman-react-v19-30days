// useLocalStorage：把 Day08 待辦清單裡「用 useState 讀取初始值、
// 用 useEffect 同步寫回 localStorage」這一整套邏輯，抽成一個可以重複使用的自訂 Hook。
//
// 刻意讓回傳值維持 [value, setValue] 這個跟 useState 一模一樣的形狀，
// 這樣呼叫端幾乎可以直接把 useState(initialValue) 換成
// useLocalStorage(key, initialValue)，不需要改動其他任何程式碼。
import { useEffect, useState } from 'react'

// 讀取指定 key 目前存在 localStorage 裡的值；讀不到、或格式解析失敗時，
// 都退回使用呼叫端傳入的 initialValue，避免因為壞資料讓整個 App 掛掉。
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
  // Lazy Initializer（Day04 學過的寫法）：只有元件掛載的第一次渲染，
  // 才會真的去讀一次 localStorage，之後重新渲染都不會重複執行。
  const [value, setValue] = useState(() => readStoredValue(key, initialValue))

  // 對照 Day08：把「只要 value 改變，就自動同步寫回 localStorage」的 useEffect，
  // 從個別元件裡搬進這個 Hook 內部，呼叫端不需要再自己寫一次。
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`寫入 localStorage key="${key}" 失敗：`, error)
    }
  }, [key, value])

  return [value, setValue]
}

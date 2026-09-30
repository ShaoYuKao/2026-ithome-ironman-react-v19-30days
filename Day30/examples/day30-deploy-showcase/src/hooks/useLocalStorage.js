// useLocalStorage：沿用 Day13／Day21／Day22 同一份實作，把「讀取初始值、
// 資料變動時自動同步回 localStorage」的邏輯封裝起來，回傳值維持跟
// useState 一模一樣的 [value, setValue] 形狀，方便直接替換使用。
//
// 今天（Day30）用它來保存「哪些天數已經回顧過」的進度，即使重新整理
// 頁面、甚至部署到 GitHub Pages 之後跨裝置沒有共用，同一台瀏覽器上的
// 進度依然會保留。
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
  const [value, setValue] = useState(() => readStoredValue(key, initialValue))

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`寫入 localStorage key="${key}" 失敗：`, error)
    }
  }, [key, value])

  return [value, setValue]
}

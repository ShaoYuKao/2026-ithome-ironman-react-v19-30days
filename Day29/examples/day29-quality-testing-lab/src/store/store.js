import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice.js'

// 用一個「工廠函式」建立 store，而不是直接 export 一份寫死的 store 實例。
// 這是專門為了「方便測試」而做的設計：每個測試都可以呼叫 createAppStore()
// 拿到一份全新、乾淨的 store（可選擇帶入 preloadedState 指定初始資料），
// 彼此之間不會共用同一份全域狀態、不會互相汙染測試結果。
export function createAppStore(preloadedState) {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
    preloadedState,
  })
}

// App 實際執行時，只需要一份 store，掛在 main.jsx 的 <Provider> 上。
export const store = createAppStore()

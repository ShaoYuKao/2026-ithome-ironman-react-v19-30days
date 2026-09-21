// 自訂 Hook 函式庫的統一出口（Barrel File）：把今天整理的四個自訂 Hook
// 都從同一個地方匯出，讓其他檔案只需要寫一行：
//
//   import { useLocalStorage, useWindowSize, useFetch, useDebounce } from './hooks'
//
// 而不必分別記住每一個 Hook 實際放在哪一個檔案裡。這是打包一個小型
// 函式庫時很常見的慣例：對外只暴露這一個入口，內部檔案要怎麼拆分、
// 搬動，都不會影響到使用端的 import 寫法。
export { useLocalStorage } from './useLocalStorage.js'
export { useWindowSize } from './useWindowSize.js'
export { useFetch } from './useFetch.js'
export { useDebounce } from './useDebounce.js'

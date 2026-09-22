// useDebounce：今天新學的自訂 Hook，把「Debounce（去抖動）」這個常見的
// 效能優化技巧，包裝成一個只需要一行就能套用的自訂 Hook。
//
// Debounce 的概念：一個值如果在短時間內連續改變（例如使用者正在輸入框裡
// 快速打字），就先「按兵不動」，等到值「安靜下來一段時間」（例如
// 停止打字 500ms）之後，才把最新的值回報出去。中間任何一次「還沒安靜
// 就又變了」的中繼值，都會被直接捨棄，不會被回報。
//
// 這跟 Day16 學過的 useDeferredValue 目的類似（都是為了不要讓「頻繁變化
// 的值」拖慢畫面），但手段完全不同：
// - useDeferredValue：值「每一次改變」都還是會被處理，只是把處理的時機
//   延後到瀏覽器不忙的時候，最終仍然會計算出每一個中繼值對應的畫面。
// - useDebounce：只保留「安靜下來之後的最後一個值」，中間的中繼值直接
//   捨棄、完全不處理——當「處理一次的成本」很高（例如打一次 API）時，
//   Debounce 省下的是「呼叫次數」本身，而不只是「呼叫的時機」。
//
// 這也是為什麼「打字即時篩選記憶體裡的陣列」（Day16 的情境）比較適合用
// useDeferredValue，而「打字即時呼叫後端 API 搜尋」（今天 CombinedSearchDemo
// 的情境）比較適合用 useDebounce：後者如果每打一個字都呼叫一次 API，
// 不但沒有必要，還會對伺服器造成不必要的負擔。
import { useEffect, useState } from 'react'

/**
 * 回傳 value 的「去抖動」版本：只有在 value 停止改變超過 delayMs 毫秒之後，
 * 回傳值才會更新成最新的 value；delayMs 這段期間內如果 value 又變了，
 * 計時器會重新從頭計算，回傳值維持不變。
 *
 * @param {*} value 任何會頻繁改變的值（最常見的是輸入框的文字）。
 * @param {number} [delayMs=500] 值需要「安靜」多久，才會被視為最終值。
 */
export function useDebounce(value, delayMs = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // 每次 value 改變，都先安排一個「delayMs 毫秒後才更新」的計時器。
    const timerId = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    // 清除函式（Day08 學過的觀念）：如果 value 在 delayMs 毫秒之內又變了，
    // 或元件卸載了，就取消「上一次」還沒執行的計時器——這正是
    // Debounce「只保留最後一次」效果的實作關鍵：舊的計時器永遠不會真的
    // 執行到，只有「最後一次安排、且真的撐過 delayMs 毫秒」的計時器
    // 才會呼叫 setDebouncedValue。
    return () => clearTimeout(timerId)
  }, [value, delayMs])

  return debouncedValue
}

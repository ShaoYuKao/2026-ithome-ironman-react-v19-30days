import { useLayoutEffect, useRef, useState } from 'react'

// 只保留最近幾次按鍵的延遲，畫面上顯示「最近 N 鍵」的加總才有意義——
// 太舊的紀錄（例如你切換分頁前留下的數字）不應該一直累加下去。
const HISTORY_SIZE = 5

/**
 * 「輸入延遲」量測工具：真正回答「這次打字，使用者眼睛看到字出現在
 * 輸入框裡，實際等了多久？」，而不是隨口說「感覺很卡」或「感覺很順」。
 *
 * 量測原理（跟 devtools Performance 面板、或外部工具量測的邏輯是同一套）：
 * 1. 每次瀏覽器把這個按鍵處理成原生 input 事件時，記下事件本身的
 *    `event.timeStamp`（跟 `performance.now()` 同一個時間軸、
 *    代表「瀏覽器認為這個按鍵發生的當下」）。
 * 2. 用 `useLayoutEffect` 監看「驅動輸入框畫面的那個值」（也就是
 *    `<input value={displayValue} />` 綁定的那個 state）：只要它改變，
 *    代表 React 這次的重新渲染已經完成、也已經 Commit 到畫面上了。
 * 3. Commit 完成後，用 `requestAnimationFrame` 等瀏覽器真正畫出下一幀——
 *    這一刻才是使用者眼睛實際看到新字元的時間點。
 * 4. 兩個時間點相減，就是「這一鍵，使用者真正等待的延遲」。
 *
 * 這個延遲之所以能公平地在三個版本之間比較，是因為它只跟「驅動輸入框
 * 顯示的那份 state 什麼時候更新、什麼時候被畫出來」有關——完全不管
 * 背後那份「拿去做昂貴搜尋」的 state（deferredKeyword／appliedKeyword）
 * 現在算到哪裡了。這正是 useDeferredValue／useTransition 想做到的事：
 * 讓「輸入框本身」的這個數字，不被「搜尋清單」的昂貴計算拖累。
 */
export function useTypingLatency(displayValue) {
  const pendingSinceRef = useRef(null)
  const [history, setHistory] = useState([])

  function markKeyEvent(event) {
    // event.timeStamp：瀏覽器記錄「這個原生事件發生的當下」，
    // 跟 performance.now() 用的是同一個時間軸，可以直接相減。
    pendingSinceRef.current = event.timeStamp
  }

  useLayoutEffect(() => {
    if (pendingSinceRef.current == null) return
    const keyEventTime = pendingSinceRef.current
    pendingSinceRef.current = null

    // Commit 已經完成（這個 effect 正在執行，代表畫面上的 DOM 已經更新），
    // 但「更新」跟「瀏覽器真正畫出下一幀」還有一段距離，
    // 用 requestAnimationFrame 抓到那個「真正被畫出來」的時間點。
    const rafId = requestAnimationFrame(() => {
      const latency = performance.now() - keyEventTime
      setHistory((prev) => [...prev.slice(-(HISTORY_SIZE - 1)), latency])
    })
    return () => cancelAnimationFrame(rafId)
  }, [displayValue])

  const total = history.reduce((sum, value) => sum + value, 0)
  const last = history.length > 0 ? history[history.length - 1] : null

  return { markKeyEvent, history, total, last }
}

export { HISTORY_SIZE }

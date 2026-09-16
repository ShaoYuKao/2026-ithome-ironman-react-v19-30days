import { useRef, useState } from 'react'

/**
 * 共用的「新訊息抵達後，捲動到最下面」邏輯：聊天室訊息陣列變長時，
 * 量測目前的 scrollHeight，把捲動容器的 scrollTop 校正到底部，
 * 讓使用者看到剛剛送達的最新訊息。
 *
 * 刻意把「要用哪一個 Effect Hook」當成參數（effectHook）傳進來，
 * 讓 useEffect 版本、useLayoutEffect 版本可以共用同一段量測與捲動邏輯，
 * 兩者唯一的差異只在「這段捲動修正，是繪製前執行、還是繪製後才執行」——
 * 這正是今天想讓你直接對比出來的重點。
 *
 * 之所以選「捲動位置」當作對照的視覺訊號，是因為「一大段空間位移」
 * 對人眼來說比「一小塊色塊變色」明顯得多，不容易因為反應不及而錯過，
 * 也剛好呼應「useLayoutEffect vs useEffect」在真實世界最常見的場景之一：
 * 聊天室、留言串收到新訊息時，要不要讓使用者先看到清單「卡在舊的捲動
 * 位置」一下下，還是完全不露出這個中間狀態。
 *
 * 另外會回傳一份 history（時間軸紀錄）：每次捲動狀態被（重新）決定時，
 * 都記下「距離新訊息抵達過了多少毫秒、當時是卡在舊位置還是已經捲到底」。
 * 這份紀錄的用途，是把「useEffect 版本會不會先出現卡住的舊畫面」這件事，
 * 從「肉眼盯著畫面看有沒有跳一下」，變成畫面上就能直接讀到的文字證據。
 *
 * @param {typeof import('react').useEffect} effectHook 要使用的 Effect Hook
 * @param {object} options
 * @param {unknown[]} options.messages 目前的訊息陣列，長度增加代表有新訊息抵達
 * @param {React.RefObject} options.containerRef 捲動容器本身的 ref
 * @param {boolean} [options.simulateSlowMeasurement] 是否刻意放慢這段量測，
 *   讓原本可能只有 1 個影格、人眼很難察覺的差異，放大成看得見的效果。
 * @param {boolean} [options.waitForPaint] 只有 useEffect 版本需要傳 `true`（見下方說明）。
 */
export function useAutoScrollToBottom(
  effectHook,
  { messages, containerRef, simulateSlowMeasurement = false, waitForPaint = false },
) {
  const [atBottom, setAtBottom] = useState(true) // 樂觀假設一開始就在底部
  const [lastDurationMs, setLastDurationMs] = useState(null)
  const [history, setHistory] = useState([])
  const prevCountRef = useRef(messages.length)
  const pendingSinceRef = useRef(null) // 這一輪「新訊息抵達」的起始時間

  // 修正：跟 Day17 提示框範例踩過的坑一模一樣——`useState(true)` 這個初始值
  // 只在元件第一次掛載時生效一次。如果只單純依賴這個 state，第二次以後
  // 新訊息抵達時，`atBottom` 會直接沿用上一輪已經修正過的 `true`，畫面
  // 從一開始就「看起來」在底部，暫時卡住的狀態就再也不會出現。這裡採用
  // React 官方建議的「渲染期間依資料變化調整 state」寫法：只要偵測到
  // `messages.length` 變多（代表新訊息抵達），就在渲染階段同步把
  // `atBottom` 重置成 `false`，讓 Effect 接下來又能重新走一次完整的
  // 「stale（卡住）→ corrected（已捲到底）」過程。
  if (messages.length !== prevCountRef.current) {
    const arrived = messages.length > prevCountRef.current
    prevCountRef.current = messages.length
    if (arrived) {
      if (atBottom !== false) setAtBottom(false)
      if (lastDurationMs !== null) setLastDurationMs(null)
      pendingSinceRef.current = performance.now()
      setHistory([{ atBottom: false, atMs: 0 }])
    }
  }

  effectHook(() => {
    const container = containerRef.current
    // 沒有待處理的新訊息（例如只是切換「模擬較慢量測」開關）就什麼都不做。
    if (!container || pendingSinceRef.current == null) return

    const startedAt = pendingSinceRef.current

    function runCorrection() {
      const start = performance.now()

      if (simulateSlowMeasurement) {
        // 刻意用一段同步的忙碌迴圈，模擬「量測、計算捲動位置」需要花一點時間
        // 的真實情境（例如巢狀很深的聊天室元件、或得等圖片載入完才能量出
        // 正確高度），把正常情況下只有 1 個影格（約 16ms）、人眼很難察覺的
        // 差異，放大成任何人都能一眼看出來的效果。這段延遲是「教學用的
        // 放大鏡」，不是 useLayoutEffect／useEffect 本身天生就會這麼慢。
        const busyUntil = start + 300
        while (performance.now() < busyUntil) {
          /* 刻意佔用主執行緒，不做任何事 */
        }
      }

      container.scrollTop = container.scrollHeight
      setAtBottom(true)
      setLastDurationMs(Math.round(performance.now() - start))
      setHistory((prev) => [
        ...prev,
        { atBottom: true, atMs: Math.round(performance.now() - startedAt) },
      ])
      pendingSinceRef.current = null
    }

    if (!waitForPaint) {
      // useLayoutEffect 版本：本來就一定搶在瀏覽器繪製之前同步執行，
      // 不需要、也不能再等——要是用 requestAnimationFrame 延後執行，
      // 等於把修正動作丟到下一個影格才做，反而會讓瀏覽器先畫出「卡住」
      // 的舊畫面，違背 useLayoutEffect 該有的行為。
      runCorrection()
      return
    }

    // useEffect 版本：理論上瀏覽器會在 useEffect 執行之前先畫出「卡住」的
    // 畫面，但這只是「有機會」而非鐵律——如果這次重新渲染需要處理的內容
    // 比較多（例如一次新增好幾則訊息），瀏覽器有可能還來不及完成繪製，
    // useEffect 就已經開始執行下面那段同步忙碌迴圈，導致「卡住的畫面」
    // 從頭到尾都沒有被畫出來過，示範就會失真。這裡用「連續兩次
    // requestAnimationFrame」這個常見手法，確保瀏覽器至少已經真正畫過一次
    // 「卡住」的畫面之後，才開始執行忙碌迴圈與捲動修正，讓這個範例每次
    // 都能穩定重現「先卡住、才跳到最新訊息」的過程。
    const rafIds = { first: 0, second: 0 }
    rafIds.first = requestAnimationFrame(() => {
      rafIds.second = requestAnimationFrame(runCorrection)
    })

    return () => {
      cancelAnimationFrame(rafIds.first)
      cancelAnimationFrame(rafIds.second)
    }
  }, [messages, simulateSlowMeasurement, waitForPaint])

  return { atBottom, lastDurationMs, history }
}

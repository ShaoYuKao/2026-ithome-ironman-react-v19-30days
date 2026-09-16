import { useState, useTransition } from 'react'
import { useTypingLatency } from '../utils/useTypingLatency.js'
import { MemoContactResultsList } from './ContactResultsList.jsx'
import LatencyMeter from './LatencyMeter.jsx'

/**
 * 用 `useTransition` 優化過的版本。
 *
 * 跟 useDeferredValue 版一樣，也需要「拆成兩份狀態」，但拆法不同：
 *
 * 1. `keyword`：一般的 useState，`<input>` 的 `value` 直接綁定它，
 *    在 `handleChange` 裡用一般、沒有包 startTransition 的 `setKeyword` 更新——
 *    這是一次「緊急（urgent）」更新，React 會優先處理，確保輸入框立即反應。
 * 2. `appliedKeyword`：真正拿去搜尋的關鍵字，透過 `startTransition(() => setAppliedKeyword(value))`
 *    更新——這是一次「過渡（transition）」更新，React 允許它在背景進行，
 *    而且可以被之後更緊急的更新（例如你緊接著按下的下一個按鍵）中斷、取代。
 *
 * `isPending` 是 `useTransition` 直接提供的旗標，值為 `true` 代表
 * 「還有一個過渡更新尚未完成」，很適合拿來顯示 Loading 效果——
 * 這是 useDeferredValue 沒有內建、但 useTransition 天生就有的能力。
 *
 * 與 DeferredSearchBoard 對照：兩者用的都是同一個 MemoContactResultsList，
 * 唯一差異是「決定何時更新 keyword 這個 prop」的機制不同。
 */
function TransitionSearchBoard({ contacts }) {
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [isPending, startTransition] = useTransition()
  // 同樣量測 keyword（驅動輸入框畫面的 state），跟另外兩個版本用同一套邏輯。
  const { markKeyEvent, history, total, last } = useTypingLatency(keyword)

  function handleChange(event) {
    const value = event.target.value
    markKeyEvent(event)
    setKeyword(value) // 緊急更新：讓輸入框立刻顯示這個字
    startTransition(() => {
      setAppliedKeyword(value) // 過渡更新：可以晚一點、可以被打斷
    })
  }

  return (
    <div className="search-board">
      <label className="form-field">
        <span className="form-label">搜尋聯絡人（姓名／Email／城市／部門）</span>
        <input
          type="text"
          className="form-input"
          value={keyword}
          onChange={handleChange}
          placeholder="試著快速連續輸入，例如：陳"
        />
      </label>

      <LatencyMeter last={last} history={history} total={total} />

      {isPending && (
        <p className="status-hint status-hint--pending">
          🔄 搜尋中……（isPending 為 true，輸入框仍然可以正常輸入）
        </p>
      )}

      <div className={isPending ? 'results-wrap results-wrap--stale' : 'results-wrap'}>
        <MemoContactResultsList contacts={contacts} keyword={appliedKeyword} />
      </div>
    </div>
  )
}

export default TransitionSearchBoard

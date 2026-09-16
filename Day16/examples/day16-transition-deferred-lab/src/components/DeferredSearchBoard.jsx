import { useDeferredValue, useState } from 'react'
import { useTypingLatency } from '../utils/useTypingLatency.js'
import { MemoContactResultsList } from './ContactResultsList.jsx'
import LatencyMeter from './LatencyMeter.jsx'

/**
 * 用 `useDeferredValue` 優化過的版本。
 *
 * 關鍵設計：`keyword`（驅動輸入框畫面的 state）跟拿去搜尋的值，
 * 被刻意「拆成兩份」——
 *
 * 1. `keyword`：一般的 useState，`<input>` 的 `value` 直接綁定它，
 *    每次打字都會「立即」更新，輸入框本身永遠不會卡頓、永遠即時反應按鍵。
 * 2. `deferredKeyword`：`useDeferredValue(keyword)` 回傳的「延遲值」，
 *    在畫面更新有其他更緊急的工作（例如這次的按鍵輸入）要處理時，
 *    它會暫時「維持舊值」，等瀏覽器有餘裕後，React 才會在背景
 *    用新的 keyword 重新計算一次，並在算完後才把畫面換成新結果。
 *
 * `isStale`（`keyword !== deferredKeyword`）代表「畫面上顯示的搜尋結果，
 * 還沒跟上你剛剛打的最新關鍵字」，可以拿來做一個淡出效果，
 * 讓使用者知道「結果正在補上，不是壞掉了」。
 *
 * MemoContactResultsList 是用 `memo` 包過的清單元件：
 * 只要 `deferredKeyword` 還沒變，這個元件就不會被重新渲染，
 * 這正是 useDeferredValue 真正發揮效果的地方——
 * 它讓 React 可以在「輸入框需要立刻更新」跟「清單還沒必要重算」
 * 這兩件事之間，先完成前者。
 */
function DeferredSearchBoard({ contacts }) {
  const [keyword, setKeyword] = useState('')
  const deferredKeyword = useDeferredValue(keyword)
  const isStale = keyword !== deferredKeyword
  // 一樣量測「keyword 這個驅動輸入框畫面的 state」，跟 SyncSearchBoard
  // 使用完全相同的量測邏輯——這樣兩邊的數字才具有可比較性。
  const { markKeyEvent, history, total, last } = useTypingLatency(keyword)

  return (
    <div className="search-board">
      <label className="form-field">
        <span className="form-label">搜尋聯絡人（姓名／Email／城市／部門）</span>
        <input
          type="text"
          className="form-input"
          value={keyword}
          onChange={(event) => {
            markKeyEvent(event)
            setKeyword(event.target.value)
          }}
          placeholder="試著快速連續輸入，例如：陳"
        />
      </label>

      <LatencyMeter last={last} history={history} total={total} />

      {isStale && (
        <p className="status-hint status-hint--stale">
          ⏳ 關鍵字已經更新，結果正在背景重新計算中……（畫面暫時維持舊結果，不會卡住輸入）
        </p>
      )}

      <div className={isStale ? 'results-wrap results-wrap--stale' : 'results-wrap'}>
        <MemoContactResultsList contacts={contacts} keyword={deferredKeyword} />
      </div>
    </div>
  )
}

export default DeferredSearchBoard

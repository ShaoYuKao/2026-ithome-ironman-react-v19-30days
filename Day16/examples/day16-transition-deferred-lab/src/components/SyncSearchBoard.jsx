import { useState } from 'react'
import { searchContacts, RESULT_PAGE_SIZE } from '../utils/searchContacts.js'
import { useTypingLatency } from '../utils/useTypingLatency.js'
import ContactRow from './ContactRow.jsx'
import LatencyMeter from './LatencyMeter.jsx'

/**
 * 「無優化」版本，故意寫成大多數初學者第一次做搜尋框最直覺的寫法：
 * `onChange` 觸發 `setKeyword`，`setKeyword` 觸發重新渲染，
 * 重新渲染的過程中直接、同步呼叫昂貴的 searchContacts。
 *
 * 這一整段（從「使用者放開按鍵」到「新的一個字出現在輸入框裡」）
 * 在 React 眼中是「同一個不可分割的更新」：只要 searchContacts 要花 80ms，
 * 使用者就必須真真實實地等上 80ms，才會看到自己剛剛打的字出現在畫面上——
 * 因為 React 必須先跑完整個重新渲染、把結果 Commit 到畫面，才會讓瀏覽器繼續處理下一個按鍵。
 */
function SyncSearchBoard({ contacts }) {
  const [keyword, setKeyword] = useState('')
  // 驅動輸入框畫面的正是 keyword 本身，所以直接量測「keyword 這個 state
  // 什麼時候真正被畫出來」，就等於量測「這個版本，輸入框到底有多卡」。
  const { markKeyEvent, history, total, last } = useTypingLatency(keyword)

  // 👇 沒有 useMemo、也沒有 useDeferredValue／useTransition：
  // 只要這個元件重新渲染，就會同步執行一次昂貴的 searchContacts，
  // 而且是「擋住」這次渲染完成、擋住畫面更新的同步執行。
  const { list, duration } = searchContacts(contacts, keyword)
  const pageItems = list.slice(0, RESULT_PAGE_SIZE)

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

      <p className="board-meta">
        本次搜尋花費 <strong>{duration.toFixed(1)} ms</strong>　·　
        共 {list.length.toLocaleString()} 筆符合（僅顯示前 {RESULT_PAGE_SIZE} 筆）
      </p>
      <ul className="contact-list">
        {pageItems.map((contact) => (
          <ContactRow key={contact.id} contact={contact} />
        ))}
      </ul>
    </div>
  )
}

export default SyncSearchBoard

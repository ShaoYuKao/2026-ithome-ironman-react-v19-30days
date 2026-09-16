import { memo, useMemo } from 'react'
import { searchContacts, RESULT_PAGE_SIZE } from '../utils/searchContacts.js'
import ContactRow from './ContactRow.jsx'

/**
 * 「搜尋結果清單」本身：接收 contacts（完整資料）與 keyword（已經決定好、
 * 要拿來搜尋的關鍵字），呼叫 searchContacts 算出結果並畫出清單。
 *
 * 這個元件被 DeferredSearchBoard、TransitionSearchBoard 兩邊共用——
 * 兩邊的差異完全不在「怎麼畫清單」，而在「父層怎麼決定、怎麼排程
 * 傳進來的 keyword 這個 prop 什麼時候更新」。這正是今天最重要的觀念：
 * useDeferredValue、useTransition 兩者都不是「讓運算變快」的工具，
 * 而是「讓 React 排程這次更新的優先權」的工具。
 *
 * 額外用 memo 包起來：只要 contacts、keyword 這兩個 props 沒有改變
 * （用 Object.is 淺層比較），就直接跳過重新渲染——這讓待會 useDeferredValue／
 * useTransition 在「背景重新渲染」時，能真的省下重複執行這段昂貴計算的成本，
 * 而不只是把它排到比較後面而已。
 */
function ContactResultsList({ contacts, keyword }) {
  const { list, duration } = useMemo(
    () => searchContacts(contacts, keyword),
    [contacts, keyword],
  )
  const pageItems = list.slice(0, RESULT_PAGE_SIZE)

  return (
    <>
      <p className="board-meta">
        本次搜尋花費 <strong>{duration.toFixed(1)} ms</strong>　·　
        共 {list.length.toLocaleString()} 筆符合（僅顯示前 {RESULT_PAGE_SIZE} 筆）
      </p>
      <ul className="contact-list">
        {pageItems.map((contact) => (
          <ContactRow key={contact.id} contact={contact} />
        ))}
      </ul>
    </>
  )
}

const MemoContactResultsList = memo(ContactResultsList)

export { ContactResultsList, MemoContactResultsList }

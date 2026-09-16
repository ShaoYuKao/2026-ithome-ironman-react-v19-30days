// 刻意設計成「很花時間」的迴圈次數：搭配 6,000 筆聯絡人資料，
// 在一般筆電上，搜尋一次大約會花費 40～90 毫秒——這正是本章要示範的
// 「勾在 input 打字這件事上，會被使用者立刻感覺到」的等級，
// 但又不會誇張到讓瀏覽器整個沒有回應。
const SLOW_LOOP_ITERATIONS = 1200

/**
 * 刻意設計成「很花時間」的關聯分數計算，模擬真實情境中「全文搜尋、
 * 相似度比對」這類沒辦法用簡單字串比較就算完的昂貴運算。
 *
 * 這裡的計算過程本身沒有任何實際商業意義，純粹是刻意寫一段「不能被瀏覽器
 * 一瞬間跳過」的迴圈，讓後面「有沒有用 useDeferredValue／useTransition」
 * 的差異變得看得見、感覺得到——重點不在「這段計算好不好」，
 * 而在「當它發生時，React 有沒有機會先讓使用者輸入的按鍵顯示出來」。
 */
function computeRelevance(contact, keyword) {
  let score = contact.id
  for (let i = 0; i < SLOW_LOOP_ITERATIONS; i++) {
    score = Math.sqrt(score * 1.000001 + (i % 7))
  }
  return keyword && contact.name.startsWith(keyword) ? score + 1000 : score
}

/**
 * 依關鍵字搜尋聯絡人（比對姓名、Email、城市、部門），
 * 依「關聯分數」排序後回傳，並附上這次搜尋實際花費的毫秒數。
 *
 * 注意：`computeRelevance` 刻意寫在「判斷是否符合關鍵字」之前，
 * 對**每一筆**聯絡人都無條件執行一次——這模擬真實世界全文搜尋引擎
 * 「掃描、比對每一筆資料才能判斷相不相關」的成本模型，也確保這個範例
 * 不會因為關鍵字打得越長、篩選後剩下的筆數越少，計算成本就跟著變少。
 * 不管你打了什麼關鍵字，每次搜尋都需要重新掃過完整的 6,000 筆資料。
 *
 * 這是一個純函式（Pure Function）：只要傳入的 contacts、keyword 完全相同，
 * 回傳結果永遠相同，這正是待會可以放心用 useMemo 快取、
 * 也可以放心交給 useTransition／useDeferredValue 排程的前提。
 */
export function searchContacts(contacts, keyword) {
  const start = performance.now()

  const trimmedKeyword = keyword.trim()
  const results = []

  for (const contact of contacts) {
    const relevance = computeRelevance(contact, trimmedKeyword)
    const isMatch =
      trimmedKeyword === '' ||
      contact.name.includes(trimmedKeyword) ||
      contact.email.includes(trimmedKeyword) ||
      contact.city.includes(trimmedKeyword) ||
      contact.department.includes(trimmedKeyword)

    if (isMatch) {
      results.push({ ...contact, relevance })
    }
  }

  results.sort((a, b) => b.relevance - a.relevance)

  const duration = performance.now() - start
  return { list: results, duration }
}

export const CONTACT_COUNT = 6000
export const RESULT_PAGE_SIZE = 30

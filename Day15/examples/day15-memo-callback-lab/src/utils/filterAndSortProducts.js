// 刻意設計成「很花時間」的迴圈次數：3,000 筆資料 × 600 次迴圈，
// 在一般筆電上大約會花費 30～60 毫秒——足以讓使用者「感覺到」卡頓，
// 但又不會誇張到讓瀏覽器整個沒有回應，很適合拿來做效能優化的教學示範。
const SLOW_LOOP_ITERATIONS = 600

/**
 * 刻意設計成「很花時間」的分數計算，模擬真實情境中「排序前，
 * 需要先為每一筆資料計算出一個複雜分數（例如推薦分數、相似度分數、
 * 搜尋比對分數）」的昂貴運算。
 *
 * 這裡的計算過程本身沒有任何實際商業意義，純粹是刻意寫一段「不能被瀏覽器
 * 一瞬間跳過」的迴圈，讓後面「有沒有用 useMemo 快取」的差異變得看得見、感覺得到。
 */
function computeScore(product) {
  let score = product.price + product.stock
  for (let i = 0; i < SLOW_LOOP_ITERATIONS; i++) {
    score = Math.sqrt(score * 1.000001 + (i % 7))
  }
  return score
}

/**
 * 依關鍵字篩選、依 sortKey 排序，回傳排序後的清單與這次運算實際花費的毫秒數。
 *
 * 這個函式本身是一個「純函式（Pure Function）」：只要傳入的 products、keyword、
 * sortKey 完全相同，回傳的結果永遠相同，執行過程也不會偷偷修改傳入的參數、
 * 不依賴任何外部可變狀態。這正是「可以被 useMemo 安心快取」的前提——
 * 如果這個函式每次執行結果都可能不一樣（例如裡面呼叫了 Math.random()、
 * 或讀取了某個會變動的外部變數），快取住的結果就會是錯的。
 */
export function filterAndSortProducts(products, keyword, sortKey) {
  const start = performance.now()

  const trimmedKeyword = keyword.trim()
  const filtered =
    trimmedKeyword === ''
      ? products
      : products.filter(
          (product) =>
            product.name.includes(trimmedKeyword) ||
            product.category.includes(trimmedKeyword),
        )

  const scored = filtered.map((product) => ({
    ...product,
    score: computeScore(product),
  }))

  scored.sort((a, b) => {
    if (sortKey === 'price-asc') return a.price - b.price
    if (sortKey === 'stock-desc') return b.stock - a.stock
    return b.score - a.score // 預設：推薦分數高到低
  })

  const duration = performance.now() - start
  return { list: scored, duration }
}

export const SORT_OPTIONS = [
  { value: 'score-desc', label: '推薦分數（高到低）' },
  { value: 'price-asc', label: '價格（低到高）' },
  { value: 'stock-desc', label: '庫存（高到低）' },
]

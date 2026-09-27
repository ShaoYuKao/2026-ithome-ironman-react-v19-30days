// 集中管理「文章 API」的網址組合邏輯與分類標籤，避免每個元件／thunk 各自組字串。
// 內容與 Day20 的 utils/articlesApi.js 完全相同——今天要換的是「怎麼呼叫」這兩個
// 函式（改由 articlesSlice.js 的 createAsyncThunk 呼叫），不是這兩支 API 本身。
export const CATEGORY_LABELS = {
  tech: '技術',
  life: '生活',
  design: '設計',
}

export const ARTICLE_CATEGORIES = [{ value: 'all', label: '全部' }, ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))]

/**
 * 組出 GET /api/articles 的網址。
 * simulateError 為 true 時，會讓後端這次請求固定回傳 500，
 * 用來穩定重現「錯誤畫面 + 重試按鈕」的操作流程。
 */
export function buildArticlesUrl({ category, simulateError }) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (simulateError) params.set('simulateError', 'true')
  const query = params.toString()
  return `/api/articles${query ? `?${query}` : ''}`
}

/** 組出 GET /api/articles/:id 的網址，同樣支援 simulateError。 */
export function buildArticleDetailUrl(id, { simulateError } = {}) {
  const params = new URLSearchParams()
  if (simulateError) params.set('simulateError', 'true')
  const query = params.toString()
  return `/api/articles/${id}${query ? `?${query}` : ''}`
}

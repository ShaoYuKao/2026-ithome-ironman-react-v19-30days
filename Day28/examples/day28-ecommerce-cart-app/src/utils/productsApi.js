// utils/productsApi.js：集中管理「商品 API」的網址組合邏輯與分類標籤，
// 對照 Day27 的 utils/articlesApi.js。
//
// 跟 Day27 不同的地方：今天的商品資料量小（10 筆），後端 GET /api/products
// 一律回傳「全部商品」，不支援 ?category= 篩選——分類篩選改在前端用
// Array.filter 處理（見 ProductListPage.jsx）。這是刻意的簡化：資料量小時，
// 不需要每次切換分類都重新打一次 API，直接篩選已經在 store 裡的資料即可；
// 資料量大時（例如 Day27 的文章、或真實電商動辄上千筆商品），才需要交給後端
// 分頁／篩選，那種情境下 Day27 的 category query string 寫法會更合適。
export const CATEGORY_LABELS = {
  peripheral: '電腦周邊',
  audio: '音訊',
  wearable: '穿戴裝置',
  accessory: '生活配件',
}

export const PRODUCT_CATEGORIES = [
  { value: 'all', label: '全部商品' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
]

/**
 * 組出 GET /api/products 的網址。
 * simulateError 為 true 時，會讓後端這次請求固定回傳 500，
 * 用來穩定重現「錯誤畫面 + 重試按鈕」的操作流程（做法與 Day27 相同）。
 */
export function buildProductsUrl({ simulateError } = {}) {
  const params = new URLSearchParams()
  if (simulateError) params.set('simulateError', 'true')
  const query = params.toString()
  return `/api/products${query ? `?${query}` : ''}`
}

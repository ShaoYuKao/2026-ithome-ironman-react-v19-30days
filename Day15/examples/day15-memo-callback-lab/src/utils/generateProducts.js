const CATEGORIES = ['電子產品', '居家生活', '服飾', '書籍', '運動用品', '美妝保養']

/**
 * 產生指定數量的假商品資料，模擬「數千筆真實資料」的情境。
 * 這個函式只會在 MemoCallbackLab 掛載時被呼叫「一次」——
 * 搭配 useState 的惰性初始化寫法（Day04、Day12 都用過同樣的手法），
 * 避免每次重新渲染都重新產生一份新的假資料。
 */
export function generateProducts(count) {
  const products = []
  for (let i = 0; i < count; i++) {
    products.push({
      id: i + 1,
      name: `商品 #${String(i + 1).padStart(4, '0')}`,
      category: CATEGORIES[i % CATEGORIES.length],
      price: Math.round((50 + Math.random() * 2000) * 100) / 100,
      stock: Math.floor(Math.random() * 200),
    })
  }
  return products
}

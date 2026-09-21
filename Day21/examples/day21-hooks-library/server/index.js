// Day21 範例後端：一個很小的 Express API，只提供一支「商品搜尋」端點，
// 讓 CombinedSearchDemo 元件可以同時練習今天函式庫裡的 useDebounce 與 useFetch。
//
// 刻意設計了兩個重點，呼應今天「效能優化」的主題：
// 1. 固定模擬 400ms 網路延遲，並且會把「每一次真正送到伺服器的請求」記錄
//    在 console，方便對照畫面上的「實際送出次數」計數器，親眼驗證
//    useDebounce 確實大幅減少了不必要的 API 呼叫。
// 2. 支援 ?q= 關鍵字（比對商品名稱／分類）與空字串（回傳全部商品），
//    刻意不做分頁，維持這支範例 API 的單純。
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4021

app.use(cors())

const products = [
  { id: 1, name: '人體工學辦公椅', category: '家具', price: 4980 },
  { id: 2, name: '電動升降書桌', category: '家具', price: 8900 },
  { id: 3, name: '無線藍牙滑鼠', category: '3C 周邊', price: 690 },
  { id: 4, name: '機械式鍵盤', category: '3C 周邊', price: 2280 },
  { id: 5, name: '27 吋 4K 螢幕', category: '3C 周邊', price: 9600 },
  { id: 6, name: '螢幕支架', category: '3C 周邊', price: 1200 },
  { id: 7, name: '筆記型電腦散熱墊', category: '3C 周邊', price: 590 },
  { id: 8, name: '磨豆機', category: '生活家電', price: 3200 },
  { id: 9, name: '手沖咖啡壺', category: '生活家電', price: 890 },
  { id: 10, name: '空氣清淨機', category: '生活家電', price: 5400 },
  { id: 11, name: '除濕機', category: '生活家電', price: 6800 },
  { id: 12, name: '桌上型檯燈', category: '家具', price: 1490 },
  { id: 13, name: '收納置物櫃', category: '家具', price: 2600 },
  { id: 14, name: '瑜珈墊', category: '運動用品', price: 780 },
  { id: 15, name: '啞鈴組（可調式）', category: '運動用品', price: 1980 },
  { id: 16, name: '慢跑鞋', category: '運動用品', price: 2380 },
  { id: 17, name: '藍牙耳機', category: '3C 周邊', price: 1590 },
  { id: 18, name: '行動電源', category: '3C 周邊', price: 890 },
  { id: 19, name: '保溫杯', category: '生活雜貨', price: 450 },
  { id: 20, name: '筆記本與鋼筆組', category: '生活雜貨', price: 680 },
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// GET /api/products?q=鍵盤
app.get('/api/products', async (req, res) => {
  const keyword = (req.query.q || '').trim()

  // 記錄每一次「真正打到伺服器」的請求，對照前端畫面上的次數統計，
  // 用來驗證 useDebounce 真的減少了呼叫次數，而不是只有「感覺變快了」。
  console.log(`[day21-hooks-library] GET /api/products?q=${keyword || '(空字串，回傳全部)'}`)

  await delay(400)

  const matched = keyword
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(keyword.toLowerCase()) ||
          product.category.toLowerCase().includes(keyword.toLowerCase()),
      )
    : products

  res.json({
    query: keyword,
    count: matched.length,
    products: matched,
    fetchedAt: new Date().toISOString(),
  })
})

app.listen(PORT, () => {
  console.log(`[day21-hooks-library] Express server ready at http://localhost:${PORT}`)
})

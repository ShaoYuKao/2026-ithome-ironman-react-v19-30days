// Day20 範例後端：一個很小的 Express API，提供「文章列表」與「文章詳情」兩支端點，
// 供前端的 useFetch(url) 自訂 Hook 練習 loading / error / success 三種狀態。
//
// 刻意設計了幾個重點，對應今天要驗證的情境：
// 1. 每次請求都模擬網路延遲（列表 700ms、詳情 500ms），讓 loading skeleton
//    有足夠時間可以被觀察到，而不是一閃即逝。
// 2. 列表支援 ?category= 篩選、詳情支援「找不到的 ID 回傳 404」，示範
//    useFetch 面對「伺服器錯誤（500）」與「資源不存在（404）」兩種不同錯誤，
//    最終都能被同一套「檢查 response.ok、不是就 throw」邏輯統一處理。
// 3. 兩支端點都支援 ?simulateError=true，讓前端可以用一個核取方塊，
//    穩定地（而不是隨機地）重現「錯誤畫面 + 重試按鈕」的完整操作流程。
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4020

app.use(cors())
app.use(express.json())

// ---- 模擬資料庫 ----
// content 欄位刻意只在「詳情」API 才會回傳，列表 API 只回傳摘要欄位——
// 這是真實世界 API 常見的設計（列表輕量、詳情才載入完整內容），
// 也是本日範例讓 useFetch 在兩個不同元件被「重複使用」的理由之一。
const articles = [
  {
    id: 1,
    category: 'tech',
    title: 'React 19 的 Actions：讓表單送出狀態不再靠一堆 useState',
    author: '陳雅婷',
    publishedAt: '2026-01-12',
    readMinutes: 6,
    excerpt: '過去要處理表單送出中、成功、失敗，得自己刻好幾個 state。React 19 的 Actions 系列 Hook 把這件事變得單純多了。',
    content:
      '過去寫一個會呼叫 API 的表單，得自己管理「送出中」「成功」「失敗」三種畫面，還要記得在送出前 preventDefault、送出後清空欄位。這些重複的樣板程式碼，幾乎每個表單都要重寫一次。\n\nReact 19 新增的 useActionState、useFormStatus 等 Hook，把「表單送出」這件事整理成一套標準模式：把送出邏輯包成一個 async 函式（Action），剩下的 pending 狀態、錯誤處理，都交給框架統一管理，元件的程式碼因此變得更專注在畫面本身。',
  },
  {
    id: 2,
    category: 'tech',
    title: '從 callback 到 async/await：JavaScript 非同步寫法的演進',
    author: '林柏宇',
    publishedAt: '2026-01-18',
    readMinutes: 5,
    excerpt: '同樣是「等資料回來再做事」，JavaScript 這些年換了好幾種寫法。理解演進脈絡，能幫助你看懂各種年代的舊程式碼。',
    content:
      '最早的非同步程式碼幾乎都靠 callback：把「等一下要做的事」包成一個函式，傳給非同步 API，等結果出來再被呼叫。這種寫法在多層巢狀時會變得很難閱讀，俗稱「回呼地獄（callback hell）」。\n\nPromise 的出現讓非同步流程可以用 .then() 串接，讀起來像一條線；而 async/await 則讓非同步程式碼「長得像」同步程式碼，是目前最主流、也最容易讀懂的寫法。理解這段演進，有助於看懂不同年代、不同專案裡混用的寫法。',
  },
  {
    id: 3,
    category: 'tech',
    title: '為什麼你的網站在手機上跑起來特別慢？前端效能優化入門',
    author: '黃詩涵',
    publishedAt: '2026-01-25',
    readMinutes: 7,
    excerpt: '桌機上明明很流暢，換成手機測試卻卡頓不已？從圖片、JavaScript bundle 大小、渲染次數三個方向排查最有效率。',
    content:
      '手機的處理器效能與網路頻寬通常遠不如桌機，桌機上「感覺不出來」的效能問題，到了手機上很容易被放大。排查時建議先看三個地方：圖片是否過大沒有壓縮、JavaScript 的 bundle 是否過度龐大、畫面是否因為狀態設計不良而重複渲染。\n\n工具方面，瀏覽器內建的效能分析工具（Performance 面板）與 React DevTools 的 Profiler，都能具體標出「哪一段程式碼」「花了多少時間」，比起憑感覺猜測有效率得多。',
  },
  {
    id: 4,
    category: 'life',
    title: '番茄鐘工作法真的有用嗎？我實際用了三個月的心得',
    author: '王建宏',
    publishedAt: '2026-02-02',
    readMinutes: 4,
    excerpt: '25 分鐘專注、5 分鐘休息，聽起來很簡單，實際執行三個月後，我發現真正有效的關鍵並不是那個計時器本身。',
    content:
      '番茄鐘工作法的規則很單純：設定 25 分鐘計時器，這段時間只做一件事，時間到強制休息 5 分鐘。一開始我以為效果來自「切成小段比較不累」，但用了三個月後發現，真正有幫助的其實是「開始前先決定好這 25 分鐘要做什麼」這個動作。\n\n換句話說，番茄鐘更像是一個「逼自己先規劃、再動手」的儀式，計時器本身反而是其次。如果只是機械式地設定時間，卻沒有想清楚這段時間的目標，效果會大打折扣。',
  },
  {
    id: 5,
    category: 'life',
    title: '一人份的義式手沖咖啡：新手在家也能沖出穩定風味',
    author: '李思穎',
    publishedAt: '2026-02-08',
    readMinutes: 5,
    excerpt: '不需要昂貴器材，掌握水溫、粉水比例、注水節奏三個變因，在家也能穩定沖出不輸咖啡廳的風味。',
    content:
      '手沖咖啡看似需要很多經驗，但新手只要先固定三個變因，就能沖出穩定的風味：水溫控制在攝氏 90 到 94 度之間、粉水比例抓在 1 比 15 左右、注水時分成兩到三段，第一段先悶蒸 30 秒讓咖啡粉均勻吸水。\n\n比起追求「完美的一杯」，新手更重要的是每次都用同樣的條件沖煮，這樣才能比較出「哪一個變因改變了，味道跟著怎麼變」，慢慢找到自己喜歡的風味，而不是每次憑感覺亂調。',
  },
  {
    id: 6,
    category: 'life',
    title: '從雜亂到整齊：一週內收納好房間的簡單原則',
    author: '陳雅婷',
    publishedAt: '2026-02-14',
    readMinutes: 4,
    excerpt: '收納房間最難的不是「整理」，而是「維持」。掌握兩個簡單原則，讓整齊的狀態可以一直持續下去。',
    content:
      '很多人收納房間時，會先花一整天把所有東西分類擺好，但過沒多久又打回原形。真正的關鍵原則有兩個：「東西要有固定的家」（每一樣物品都該有一個明確的擺放位置，用完就歸位），以及「入一出一」（買進一件新物品，就淘汰一件舊物品，避免東西只增不減）。\n\n這兩個原則聽起來簡單，卻是維持整齊最有效的方法。與其追求一次到位的完美收納，不如先建立這兩個習慣，整齊的狀態自然就能持續下去。',
  },
  {
    id: 7,
    category: 'design',
    title: '什麼是設計系統（Design System）？從零開始理解',
    author: '林柏宇',
    publishedAt: '2026-02-20',
    readMinutes: 6,
    excerpt: 'Design System 不只是一份元件庫，而是一套讓團隊「用同一種語言討論設計」的完整規則與工具集合。',
    content:
      'Design System（設計系統）常被誤以為只是一組現成的 UI 元件庫，但它實際涵蓋的範圍更廣：包含顏色、字型、間距這類「設計語彙（Design Tokens）」，也包含按鈕、輸入框這類可重複使用的元件，甚至還有「什麼情境該用哪一種元件」的使用規範。\n\n它真正解決的問題，是讓設計師與工程師之間有一套共同的語言——設計師說「用 Primary Button」，工程師就知道對應哪一段程式碼；不用每次都重新討論顏色、圓角、間距這些細節，團隊協作的效率因此大幅提升。',
  },
  {
    id: 8,
    category: 'design',
    title: '留白不是浪費空間：初學者常忽略的排版原則',
    author: '黃詩涵',
    publishedAt: '2026-02-26',
    readMinutes: 4,
    excerpt: '版面留白常被誤會成「還沒填滿內容」，但適當的留白其實是幫助使用者聚焦、降低閱讀負擔的重要工具。',
    content:
      '排版初學者常見的錯誤，是看到空白的地方就想塞入更多文字或圖片，深怕「浪費版面」。但留白（Whitespace）其實有明確的功能：它能幫助畫面上的元素彼此區隔開來，讓使用者的視線知道該從哪裡開始閱讀、在哪裡停頓。\n\n留白也分成「元素之間的留白」與「版面邊界的留白」，兩者都需要刻意設計，而不是隨機留下的空隙。下次排版時，不妨先問自己：這裡留白，是不是能讓使用者更容易理解畫面的閱讀順序？',
  },
  {
    id: 9,
    category: 'design',
    title: '深色模式（Dark Mode）設計時，這三個細節最容易被忽略',
    author: '王建宏',
    publishedAt: '2026-03-04',
    readMinutes: 5,
    excerpt: '深色模式不是把白底換成黑底這麼簡單，色彩對比、陰影表現、圖片留白，都是初次設計時容易踩雷的地方。',
    content:
      '很多人設計深色模式的第一步，就是把背景從白色換成黑色、文字從黑色換成白色，但這樣往往會讓畫面對比過強，長時間閱讀反而更容易疲勞。比較好的做法，是用深灰色（而非純黑）當背景，並適度降低文字的飽和度。\n\n另外兩個常被忽略的細節：淺色模式常用的陰影（shadow）到了深色背景上幾乎看不見，需要改用「提高元素亮度」來表現層次；圖片與圖示如果背景是透明的，也要另外檢查在深色背景上是否還看得清楚。',
  },
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// GET /api/articles?category=tech&simulateError=true
app.get('/api/articles', async (req, res) => {
  // 固定延遲約 700ms，讓前端的 loading skeleton 有足夠時間被觀察到。
  await delay(700)

  if (req.query.simulateError === 'true') {
    return res.status(500).json({
      message: '伺服器暫時發生錯誤，請稍後再試（這是勾選「模擬 API 失敗」後的固定結果）',
    })
  }

  const { category } = req.query
  const filtered =
    category && category !== 'all' ? articles.filter((article) => article.category === category) : articles

  // 列表只回傳摘要欄位，完整的 content 留給「詳情」API 才回傳。
  res.json({
    articles: filtered.map(({ content: _content, ...summary }) => summary),
    fetchedAt: new Date().toISOString(),
  })
})

// GET /api/articles/:id?simulateError=true
app.get('/api/articles/:id', async (req, res) => {
  // 詳情延遲比列表短一些（500ms），模擬「單筆資料」通常比「整份列表」快。
  await delay(500)

  if (req.query.simulateError === 'true') {
    return res.status(500).json({
      message: '伺服器暫時發生錯誤，請稍後再試（這是勾選「模擬 API 失敗」後的固定結果）',
    })
  }

  const id = Number(req.params.id)
  const article = articles.find((item) => item.id === id)

  if (!article) {
    return res.status(404).json({ message: `找不到 ID 為 ${req.params.id} 的文章` })
  }

  res.json({ ...article, fetchedAt: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[day20-fetch-lab] Express server ready at http://localhost:${PORT}`)
})

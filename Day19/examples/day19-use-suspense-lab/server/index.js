// Day19 範例後端：一個很小的 Express API，只做一件事：
// GET /api/users/:id：回傳指定 ID 的使用者資料，供前端 use(promise) 讀取。
//
// 刻意設計了三個重點，對應今天要驗證的三種情境：
// 1. 每次請求都模擬約 900ms 網路延遲，讓 Suspense 的 fallback 骨架畫面有
//    足夠時間可以被觀察到，而不是一閃即逝。
// 2. 回應內容附上 fetchedAt 時間戳記：前端「切換到已經讀過的使用者」時，
//    因為命中 Promise 快取、根本不會再打這支 API，fetchedAt 自然不會變；
//    只有真的重新發出請求（例如按下「重新整理」清除快取後）fetchedAt 才會更新。
//    這讓「Promise 到底有沒有被快取」這件事，變成畫面上看得到的證據。
// 3. 找不到的 ID（例如 99）回傳 404，讓前端可以示範 use() 讀到 rejected
//    Promise 時，畫面會交給 Error Boundary 處理，而不是讓整個 App 掛掉。
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4019

app.use(cors())
app.use(express.json())

// ---- 模擬資料庫 ----
const users = new Map([
  [
    1,
    {
      id: 1,
      name: '陳雅婷',
      title: '前端工程師',
      city: '台北',
      email: 'yating.chen@example.com',
      bio: '喜歡把複雜的畫面拆成一個個小元件，最近在研究 React 19 的 Actions。',
      avatarColor: '#aa3bff',
    },
  ],
  [
    2,
    {
      id: 2,
      name: '林柏宇',
      title: '後端工程師',
      city: '新竹',
      email: 'boyu.lin@example.com',
      bio: '負責維護公司內部的 API 服務，對效能優化特別感興趣。',
      avatarColor: '#2e9e5b',
    },
  ],
  [
    3,
    {
      id: 3,
      name: '黃詩涵',
      title: 'UI/UX 設計師',
      city: '台中',
      email: 'shihhan.huang@example.com',
      bio: '相信好的使用者體驗，來自對每個互動細節的堅持。',
      avatarColor: '#b8790a',
    },
  ],
  [
    4,
    {
      id: 4,
      name: '王建宏',
      title: '資料工程師',
      city: '高雄',
      email: 'chienhung.wang@example.com',
      bio: '每天都在跟大量資料的清洗與整理奮鬥。',
      avatarColor: '#2f6fd1',
    },
  ],
  [
    5,
    {
      id: 5,
      name: '李思穎',
      title: '產品經理',
      city: '台北',
      email: 'ssuying.lee@example.com',
      bio: '喜歡在工程師與使用者之間，找到剛剛好的平衡點。',
      avatarColor: '#d33a3a',
    },
  ],
])

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

app.get('/api/users/:id', async (req, res) => {
  // 刻意模擬約 900ms 網路延遲，讓 Suspense fallback（骨架畫面）有足夠時間
  // 被觀察到，而不是一閃即逝。
  await delay(900)

  const id = Number(req.params.id)
  const user = users.get(id)

  if (!user) {
    return res.status(404).json({ message: `找不到 ID 為 ${req.params.id} 的使用者` })
  }

  res.json({ ...user, fetchedAt: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[day19-use-suspense-lab] Express server ready at http://localhost:${PORT}`)
})

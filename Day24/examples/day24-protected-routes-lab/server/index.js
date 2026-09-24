// Day24 範例後端：提供登入、受保護的個人資料、登出三支端點，讓前端練習
// loader / action 這兩個 Data API，以及「路由守衛」該如何真正驗證登入
// 狀態，而不是只靠前端自己判斷。
//
// 1. POST /api/login：驗證帳號密碼，成功則簽發一組 token（存進伺服器的
//    記憶體），回傳給前端保存。
// 2. GET /api/profile：受保護的端點，一定要帶 `Authorization: Bearer
//    <token>` header，且 token 必須是伺服器記憶體裡還記得的，才會回傳
//    個人資料 + 統計數字；否則一律回 401。
// 3. POST /api/logout：把 token 從伺服器的記憶體中移除，讓它立即失效。
//
// 刻意用「記憶體 Map」保存 token（而不是真正的資料庫或 JWT 簽章），是
// 為了讓範例保持簡單、聚焦在前端 React Router 的資料載入與路由守衛上；
// 這也順便帶來一個很好的練習情境：只要重新啟動這支伺服器，記憶體裡的
// token 就會全部清空，前端下次呼叫 /api/profile 就會收到 401，正好可以
// 驗證 Day24 dashboardLoader「token 失效就導回登入頁」的保護機制。
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4024

app.use(cors())
app.use(express.json())

// 教學用的假使用者資料庫：帳號、密碼都是明碼存放，僅供範例使用。
// 真實專案務必對密碼做雜湊處理（例如 bcrypt），絕對不能明碼保存。
const USERS = [
  { username: 'demo', password: 'demo1234', name: '小明', role: '一般會員' },
  { username: 'admin', password: 'admin1234', name: '志明', role: '管理員' },
]

// token -> username 的對應表，模擬伺服器保存登入狀態的地方。
const tokens = new Map()

function createToken(username) {
  const token = `tok_${username}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  tokens.set(token, username)
  return token
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getBearerToken(req) {
  const header = req.get('authorization') || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

// POST /api/login：驗證帳號密碼，成功回傳 { token, user }。
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body ?? {}

  console.log(`[day24-protected-routes-lab] POST /api/login (username=${username})`)

  await delay(300)

  const user = USERS.find((u) => u.username === username && u.password === password)

  if (!user) {
    res.status(401).json({ message: '帳號或密碼錯誤' })
    return
  }

  const token = createToken(user.username)

  res.json({
    token,
    user: { name: user.name, role: user.role },
  })
})

// GET /api/profile：受保護端點，一定要帶合法的 Authorization header。
app.get('/api/profile', async (req, res) => {
  const token = getBearerToken(req)

  console.log(
    `[day24-protected-routes-lab] GET /api/profile (token=${token ? `${token.slice(0, 12)}…` : 'none'})`,
  )

  await delay(300)

  const username = token ? tokens.get(token) : null

  if (!username) {
    res.status(401).json({ message: '未登入或登入已過期，請重新登入' })
    return
  }

  const user = USERS.find((u) => u.username === username)

  res.json({
    user: { name: user.name, role: user.role },
    stats: {
      tasks: 5,
      messages: 12,
    },
  })
})

// POST /api/logout：把目前的 token 從伺服器記憶體中移除。
app.post('/api/logout', async (req, res) => {
  const token = getBearerToken(req)

  console.log(`[day24-protected-routes-lab] POST /api/logout (token=${token ? `${token.slice(0, 12)}…` : 'none'})`)

  if (token) {
    tokens.delete(token)
  }

  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`[day24-protected-routes-lab] Express server ready at http://localhost:${PORT}`)
})

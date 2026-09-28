// Day28 範例後端：整合本週學到的兩種 API 型態，供前端兩個 slice 使用：
// 1. GET /api/products：跟 Day27 的 GET /api/articles 精神一致——模擬網路延遲、
//    支援 ?simulateError=true，讓 productsSlice 的 createAsyncThunk 有真實的
//    非同步情境可以練習（pending／fulfilled／rejected、condition 去重）。
// 2. POST /api/login、POST /api/logout：跟 Day24 的登入 API 精神一致——用
//    記憶體 Map 保存 token，示範 userSlice 如何用 createAsyncThunk 處理登入這種
//    「需要呼叫後端、且有成功／失敗兩種結果」的操作。
//
// 這支後端沒有資料庫，重新啟動後 token 會全部清空，是刻意的教學簡化。
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4028

app.use(cors())
app.use(express.json())

// ---- 商品假資料：延續 Day26 的 p01／p02 命名與售價，方便對照 ----
const PRODUCTS = [
  {
    id: 'p01',
    name: '無線滑鼠',
    category: 'peripheral',
    price: 590,
    image: '🖱️',
    stock: 42,
    description: '輕巧靜音、續航力長達 18 個月的無線滑鼠，辦公與居家皆適用。',
  },
  {
    id: 'p02',
    name: '機械式鍵盤',
    category: 'peripheral',
    price: 1990,
    image: '⌨️',
    stock: 18,
    description: '青軸機械式鍵盤，敲擊回饋清脆，附白色背光，適合長時間打字工作。',
  },
  {
    id: 'p03',
    name: 'USB-C 多合一擴充座',
    category: 'peripheral',
    price: 1290,
    image: '🔌',
    stock: 25,
    description: '一次擴充 HDMI、USB-A、SD 讀卡機，出門開會只帶一條線就夠。',
  },
  {
    id: 'p04',
    name: '27 吋 4K 顯示器',
    category: 'peripheral',
    price: 8990,
    image: '🖥️',
    stock: 7,
    description: '27 吋 4K 解析度螢幕，色彩準確，適合設計工作與文書多工。',
  },
  {
    id: 'p05',
    name: '藍牙耳機',
    category: 'audio',
    price: 990,
    image: '🎧',
    stock: 33,
    description: '輕量入耳式藍牙耳機，續航 6 小時，通話降噪清晰。',
  },
  {
    id: 'p06',
    name: '筆電支架',
    category: 'peripheral',
    price: 690,
    image: '💻',
    stock: 20,
    description: '可調整高度的鋁合金筆電支架，改善視線角度，久坐也不痠。',
  },
  {
    id: 'p07',
    name: '智慧手錶',
    category: 'wearable',
    price: 4990,
    image: '⌚',
    stock: 12,
    description: '全天候心率監測與睡眠追蹤，續航 5 天，運動、通勤都好用。',
  },
  {
    id: 'p08',
    name: '降噪耳罩式耳機',
    category: 'audio',
    price: 3290,
    image: '🎧',
    stock: 9,
    description: '主動降噪耳罩式耳機，長時間配戴依然舒適，適合通勤與飛行。',
  },
  {
    id: 'p09',
    name: '行動電源',
    category: 'accessory',
    price: 690,
    image: '🔋',
    stock: 50,
    description: '10000mAh 輕量行動電源，支援 PD 快充，手掌大小方便攜帶。',
  },
  {
    id: 'p10',
    name: '筆電包',
    category: 'accessory',
    price: 1590,
    image: '🎒',
    stock: 15,
    description: '防潑水尼龍材質筆電包，內襯加厚，適合 13～15 吋筆電。',
  },
]

// ---- 假使用者資料庫：email／密碼皆為明碼，僅供範例使用 ----
// 真實專案務必對密碼做雜湊處理（例如 bcrypt），絕對不能明碼保存。
const USERS = [
  { email: 'demo@example.com', password: 'demo1234', name: '小明' },
  { email: 'admin@example.com', password: 'admin1234', name: '志明' },
]

// token -> email 的對應表，模擬伺服器保存登入狀態的地方。
const tokens = new Map()

function createToken(email) {
  const token = `tok_${email.split('@')[0]}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  tokens.set(token, email)
  return token
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getBearerToken(req) {
  const header = req.get('authorization') || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

// GET /api/products?simulateError=true
app.get('/api/products', async (req, res) => {
  await delay(500)

  console.log(`[day28-ecommerce-cart-app] GET /api/products (simulateError=${req.query.simulateError === 'true'})`)

  if (req.query.simulateError === 'true') {
    return res.status(500).json({
      message: '伺服器暫時發生錯誤，請稍後再試（這是勾選「模擬 API 失敗」後的固定結果）',
    })
  }

  res.json({
    products: PRODUCTS,
    fetchedAt: new Date().toISOString(),
  })
})

// POST /api/login { email, password }：驗證成功回傳 { token, user }
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body ?? {}

  console.log(`[day28-ecommerce-cart-app] POST /api/login (email=${email})`)

  await delay(300)

  const user = USERS.find((u) => u.email === email && u.password === password)

  if (!user) {
    res.status(401).json({ message: '帳號或密碼錯誤，請重新輸入' })
    return
  }

  const token = createToken(user.email)

  res.json({
    token,
    user: { name: user.name, email: user.email },
  })
})

// POST /api/logout：把目前的 token 從伺服器記憶體中移除。
app.post('/api/logout', async (req, res) => {
  const token = getBearerToken(req)

  console.log(`[day28-ecommerce-cart-app] POST /api/logout (token=${token ? `${token.slice(0, 12)}…` : 'none'})`)

  if (token) {
    tokens.delete(token)
  }

  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`[day28-ecommerce-cart-app] Express server ready at http://localhost:${PORT}`)
})

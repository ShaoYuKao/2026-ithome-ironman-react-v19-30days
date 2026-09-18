// Day18 範例後端：一個很小的 Express API，只做兩件事：
// 1. POST /api/register：會員註冊。刻意加上「Email 是否已被註冊」這個
//    只有伺服器（資料庫）才知道的規則，並模擬 1 秒網路延遲，
//    讓前端 useActionState 的 isPending 有真實意義。
// 2. GET /api/comments、POST /api/comments：留言板。POST 依前端傳入的
//    networkMode（normal／slow／fail）模擬「正常」「較慢」「伺服器拒絕」
//    三種狀況，讓前端 useOptimistic 的「樂觀顯示 → 被真實結果覆蓋／消失」
//    可以被穩定重現，而不必依賴隨機失敗。
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4018

app.use(cors())
app.use(express.json())

// ---- 模擬資料庫 ----
// 預先塞一個「已經註冊過」的帳號，方便直接示範伺服器端才知道的驗證規則。
const registeredEmails = new Set(['test@example.com'])

let comments = [
  {
    id: 1,
    name: '小明',
    message: '第一則留言，大家好！歡迎體驗 useOptimistic 留言板 👋',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
]
let nextCommentId = 2

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ---- 會員註冊 ----
app.post('/api/register', async (req, res) => {
  // 刻意模擬 1 秒網路延遲：太快的話，畫面上的「註冊中...」一閃即逝，
  // 反而看不出 useActionState 的 isPending 到底有沒有正確運作。
  await delay(1000)

  const {
    name = '',
    email = '',
    password = '',
    confirmPassword = '',
    gender = '',
    city = '',
  } = req.body ?? {}

  const errors = {}

  if (!name.trim()) errors.name = '請輸入姓名'

  if (!email.trim()) {
    errors.email = '請輸入 Email'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Email 格式不正確，請確認是否包含 @ 與網域'
  }

  if (!password) {
    errors.password = '請輸入密碼'
  } else if (password.length < 8) {
    errors.password = '密碼長度至少需要 8 個字元'
  }

  if (!confirmPassword) {
    errors.confirmPassword = '請再輸入一次密碼'
  } else if (confirmPassword !== password) {
    errors.confirmPassword = '兩次輸入的密碼不一致'
  }

  if (!gender) errors.gender = '請選擇性別'
  if (!city) errors.city = '請選擇居住城市'

  // 這一條規則「必須」問伺服器才會知道：前端不可能無延遲、無外洩地
  // 驗證「這個 Email 是否已經被別人註冊過」，這正是需要真正網路請求的原因。
  if (!errors.email && registeredEmails.has(email.trim().toLowerCase())) {
    errors.email = '這個 Email 已經被註冊過了，請換一個或直接登入'
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      errors,
      message: '註冊失敗，請確認下方標示的欄位',
    })
  }

  registeredEmails.add(email.trim().toLowerCase())

  return res.status(201).json({
    success: true,
    user: { name: name.trim(), email: email.trim() },
    message: '註冊成功',
  })
})

// ---- 留言板 ----
app.get('/api/comments', async (req, res) => {
  await delay(300)
  res.json({ comments })
})

app.post('/api/comments', async (req, res) => {
  const { name = '', message = '', networkMode = 'normal' } = req.body ?? {}

  if (!message.trim()) {
    return res.status(400).json({ success: false, message: '留言內容不能是空的' })
  }

  // 三種可控制的網路狀況，讓前端可以穩定重現「樂觀顯示 → 被覆蓋」與
  // 「樂觀顯示 → 消失＋錯誤訊息」兩種結果，不必靠隨機亂數賭運氣。
  const delayMs = networkMode === 'slow' ? 2600 : networkMode === 'fail' ? 1200 : 700
  await delay(delayMs)

  if (networkMode === 'fail') {
    return res.status(500).json({
      success: false,
      message: '伺服器暫時無法處理這則留言，請稍後再試一次',
    })
  }

  const comment = {
    id: nextCommentId++,
    name: name.trim() || '匿名訪客',
    message: message.trim(),
    createdAt: new Date().toISOString(),
  }
  comments.push(comment)

  res.status(201).json({ success: true, comment })
})

app.listen(PORT, () => {
  console.log(`[day18-actions-forms-lab] Express server ready at http://localhost:${PORT}`)
})

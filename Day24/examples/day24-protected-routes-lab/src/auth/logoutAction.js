import { redirect } from 'react-router'
import { getToken, clearAuth } from './authStorage.js'
import { logoutRequest } from './authApi.js'

// logoutAction：一個沒有對應頁面元件的「資源路由（Resource Route）」
// action——只負責處理登出邏輯，示範 action 不一定要跟著一個看得到畫面的
// 頁面。NavBar 會用 <Form method="post" action="/logout"> 呼叫到這裡。
export async function logoutAction() {
  const token = getToken()

  if (token) {
    // 就算通知後端失敗（例如伺服器剛好重啟），也不影響前端清除登入狀態，
    // 所以這裡刻意忽略錯誤，不讓使用者卡在「登出失敗」的情境。
    await logoutRequest(token).catch(() => {})
  }

  clearAuth()

  return redirect('/')
}

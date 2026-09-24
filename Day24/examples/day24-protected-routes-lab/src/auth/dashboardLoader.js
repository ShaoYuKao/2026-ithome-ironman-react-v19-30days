import { redirect } from 'react-router'
import { getToken, clearAuth } from './authStorage.js'
import { fetchProfile } from './authApi.js'

// dashboardLoader：路由 "dashboard" 的 loader，在 DashboardPage 渲染
// 「之前」就先把受保護的資料準備好。
//
// 這裡同時示範 loader 層級的路由守衛，跟 RequireAuth（useEffect + 條件
// 渲染）是兩層不同性質的防護：
// 1. 完全沒有 token（從沒登入過）：loader 會先擋下來，直接 redirect，
//    DashboardPage 連渲染的機會都沒有，不會有任何畫面閃爍。
// 2. 有 token，但後端判定它已失效（例如伺服器重新啟動、記憶體裡的
//    token 清單被清空）：loader 呼叫 API 時會收到 401，這時才知道
//    「前端以為有登入」其實是過期的假象，一樣要清掉並導回登入頁。
// RequireAuth 檢查的是「本機看起來有沒有登入」，loader 檢查的才是
// 「後端到底承不承認這個登入」——兩者都需要，才是真正安全的保護。
export async function dashboardLoader({ request }) {
  const token = getToken()

  if (!token) {
    const from = new URL(request.url).pathname
    throw redirect(`/login?from=${encodeURIComponent(from)}`)
  }

  try {
    return await fetchProfile(token)
  } catch (error) {
    if (error.status === 401) {
      clearAuth()
      throw redirect('/login?from=/dashboard')
    }
    throw error
  }
}

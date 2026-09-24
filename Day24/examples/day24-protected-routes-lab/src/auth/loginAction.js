import { redirect } from 'react-router'
import { loginRequest } from './authApi.js'
import { saveAuth } from './authStorage.js'

// loginAction：路由 "login" 的 action，處理 <Form method="post"> 送出的
// 登入表單。這裡示範 action 的標準流程：讀 formData → 呼叫 API →
// 成功就 redirect()，失敗就回傳一個資料物件給 useActionData() 顯示錯誤。
export async function loginAction({ request }) {
  const formData = await request.formData()
  const username = String(formData.get('username') || '')
  const password = String(formData.get('password') || '')
  const from = String(formData.get('from') || '/dashboard')

  try {
    const { token, user } = await loginRequest(username, password)
    // 注意：這裡直接呼叫 authStorage 寫 localStorage，而不是呼叫某個
    // Context 的 setState——因為 action 執行在 React 元件樹外面，
    // 沒有 Context 可以用。
    saveAuth({ token, user })
    return redirect(from)
  } catch (error) {
    return { error: error.message }
  }
}

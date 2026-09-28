// userSlice：今天新增的第三個 slice，管理「使用者是否已登入」這份全域狀態，
// 用來保護 `/checkout` 結帳頁——對照 Day24 的路由守衛，但今天的登入狀態放在
// Redux store，不是 root loader 資料。
//
// login／logout 都刻意寫成 createAsyncThunk（而不是 reducers 裡的同步
// action），原因有兩個：
// 1. login 需要呼叫 POST /api/login 這支非同步 API，做法跟 Day27 的
//    fetchArticles 完全一樣。
// 2. 呼叫 saveAuth()／clearAuth() 屬於「side effect」（讀寫 localStorage），
//    延續 Day25 第五節「Pure Function Reducer 不能有 side effect」的原則，
//    這兩行絕對不能寫在 reducers／extraReducers 裡，只能寫在 thunk 的
//    payloadCreator 裡（跟 fetch 一樣，payloadCreator 本來就不是 reducer，
//    有 side effect 是合法且預期中的）。
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clearAuth, getAuth, saveAuth } from '../utils/authStorage.js'

// 模組載入當下就先讀一次 localStorage：如果使用者之前登入過、只是重新整理
// 瀏覽器（Redux store 本身會被整個重建，回到 initialState），這裡可以把
// 登入狀態還原回來，不需要重新登入一次。
const persisted = getAuth()

const initialState = {
  token: persisted?.token ?? null,
  current: persisted?.user ?? null, // { name, email } 或 null（未登入）
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

export const login = createAsyncThunk('user/login', async ({ email, password }, { rejectWithValue }) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    return rejectWithValue(body.message || `登入失敗（HTTP ${response.status}）`)
  }

  const data = await response.json()
  saveAuth({ token: data.token, user: data.user }) // side effect 放在 thunk 裡，不是 reducer
  return data
})

export const logout = createAsyncThunk('user/logout', async (_arg, { getState }) => {
  const { token } = getState().user
  if (token) {
    // 呼叫失敗也沒關係（例如後端剛好重啟過）：登出這個動作本身一定要成功，
    // 不能因為通知後端失敗，就讓使用者卡在「登出不了」的狀態。
    await fetch('/api/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }
  clearAuth()
  return null
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.current = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle'
        state.error = null
        state.token = null
        state.current = null
      })
  },
})

export default userSlice.reducer

// --- Selectors ---
export const selectCurrentUser = (state) => state.user.current
export const selectIsLoggedIn = (state) => state.user.current !== null
export const selectUserStatus = (state) => state.user.status
export const selectUserError = (state) => state.user.error

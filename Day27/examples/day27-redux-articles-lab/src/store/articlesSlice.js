// articlesSlice：把 Day20 useFetch(url) 处理的「文章列表 + 文章詳情」兩個非同步流程，
// 改用 createAsyncThunk + extraReducers 管理，讓資料存放在全域 store，
// 而不是各自元件自己的 state——這樣不管是 HomePage、ArticlesPage 還是
// ArticleDetailPage，讀到的都是「同一份」文章資料，不需要各自重新 fetch。
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { buildArticleDetailUrl, buildArticlesUrl } from '../utils/articlesApi.js'

const initialState = {
  // ---- 文章列表（對應 GET /api/articles?category=...） ----
  category: 'all', // 目前 items 陣列是「哪個分類」的結果
  items: [], // 文章摘要陣列（不含 content）
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  fetchedAt: null, // 最近一次成功取得列表的時間，可用來驗證「沒有重複發送請求」

  // ---- 文章詳情（對應 GET /api/articles/:id） ----
  currentArticleId: null, // 目前應該顯示的文章 id
  currentArticle: null, // 該文章的完整內容（含 content）
  currentArticleStatus: 'idle',
  currentArticleError: null,
}

// ---- Thunk 1：抓文章列表 ----
// 對照 Day20 useFetch.js 內部的 fetch(...).then(...).catch(...)：
// 這裡把同樣的「檢查 response.ok、不是就丟出有意義的錯誤」邏輯搬進 payloadCreator，
// 只是改用 thunkAPI.rejectWithValue(message) 取代原本的 throw new Error(message)。
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async ({ category, simulateError }, { rejectWithValue, signal }) => {
    const response = await fetch(buildArticlesUrl({ category, simulateError }), { signal })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return rejectWithValue(body.message || `請求失敗（HTTP ${response.status}）`)
    }
    return response.json()
  },
  {
    // condition：如果「同一個分類」已經成功抓過、而且這次不是刻意勾選「模擬 API
    // 失敗」，就直接跳過，連 pending action 都不會 dispatch，也不會真的發送請求。
    // 這正是「在多個頁面共用同一份文章資料」的關鍵——HomePage 抓過一次
    // category: 'all' 之後，ArticlesPage 用同樣的分類再 dispatch 一次，
    // 會被這裡擋下來，不會重複打 API。
    condition({ category, simulateError }, { getState }) {
      const { articles } = getState()
      if (!simulateError && articles.category === category && articles.status === 'succeeded') {
        return false
      }
    },
  },
)

// ---- Thunk 2：抓單篇文章詳情 ----
// 把 thunkAPI.signal 交給 fetch：呼叫端（ArticleDetailPage）可以透過
// dispatch(fetchArticleById(id)) 回傳的 promise.abort()，真正中止這支請求，
// 用法與 Day20 手動 new AbortController() 的效果相同，只是不需要自己建立。
export const fetchArticleById = createAsyncThunk(
  'articles/fetchArticleById',
  async (articleId, { rejectWithValue, signal }) => {
    const response = await fetch(buildArticleDetailUrl(articleId), { signal })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return rejectWithValue(body.message || `請求失敗（HTTP ${response.status}）`)
    }
    return response.json()
  },
)

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {},
  // extraReducers：createAsyncThunk 產生的 pending/fulfilled/rejected action，
  // 並不是這個 slice 自己 reducers 欄位裡定義出來的 action creator，所以要用
  // extraReducers 額外「監聽」——用 builder.addCase 把每一種 action 對應到
  // 該怎麼更新 state，取代 Day20 useFetch.js 手動維護的 isLoading/error/data。
  extraReducers: (builder) => {
    builder
      // ---- 文章列表三態 ----
      .addCase(fetchArticles.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.category = action.meta.arg.category
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.articles
        state.fetchedAt = action.payload.fetchedAt
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        // meta.aborted：這次請求是被自己 abort() 取消的（例如快速切換分類），
        // 不是真正的錯誤，畫面不該顯示、也不該覆蓋掉舊的 status。
        if (action.meta.aborted) return
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })

      // ---- 文章詳情三態 ----
      .addCase(fetchArticleById.pending, (state, action) => {
        state.currentArticleStatus = 'loading'
        state.currentArticleError = null
        state.currentArticleId = action.meta.arg
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.currentArticleStatus = 'succeeded'
        state.currentArticle = action.payload
      })
      .addCase(fetchArticleById.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.currentArticleStatus = 'failed'
        state.currentArticleError = action.payload ?? action.error.message
      })
  },
})

export default articlesSlice.reducer

// ---- Selectors ----
export const selectArticleItems = (state) => state.articles.items
export const selectArticlesCategory = (state) => state.articles.category
export const selectArticlesStatus = (state) => state.articles.status
export const selectArticlesError = (state) => state.articles.error
export const selectArticlesFetchedAt = (state) => state.articles.fetchedAt

export const selectCurrentArticleId = (state) => state.articles.currentArticleId
export const selectCurrentArticle = (state) => state.articles.currentArticle
export const selectCurrentArticleStatus = (state) => state.articles.currentArticleStatus
export const selectCurrentArticleError = (state) => state.articles.currentArticleError

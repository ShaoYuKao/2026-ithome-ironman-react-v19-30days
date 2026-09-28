// productsSlice：對照 Day27 的 articlesSlice，用 createAsyncThunk 處理
// 「商品清單」這份非同步資料，讓首頁、商品列表頁、商品詳情頁共用同一份、
// 只需要成功抓取一次的資料。
//
// 跟 Day27 的差異：今天沒有「文章詳情」那支獨立的 API，商品詳情頁直接從
// 這份 items 陣列裡用 id 查找（見檔案最下方 selectProductById）——因為
// 今天的商品資料本來就是「一次全部一起回來」，不需要像文章那樣分成列表
// （摘要）／詳情（完整內容）兩支不同的 API。
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { buildProductsUrl } from '../utils/productsApi.js'

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  fetchedAt: null,
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ simulateError } = {}, { rejectWithValue, signal }) => {
    const response = await fetch(buildProductsUrl({ simulateError }), { signal })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return rejectWithValue(body.message || `請求失敗（HTTP ${response.status}）`)
    }
    return response.json()
  },
  {
    // condition：已經成功抓過、且這次不是刻意勾選「模擬 API 失敗」，就直接跳過。
    // 這正是「首頁、商品列表頁、商品詳情頁共用同一份商品資料」的關鍵，
    // 精神與 Day27 完全相同，只是不需要再比對「分類」這個維度。
    condition({ simulateError } = {}, { getState }) {
      const { products } = getState()
      if (!simulateError && products.status === 'succeeded') {
        return false
      }
    },
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.products
        state.fetchedAt = action.payload.fetchedAt
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        // 是自己（例如換頁、StrictMode 重複執行）取消的，不是真正的錯誤。
        if (action.meta.aborted) return
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
  },
})

export default productsSlice.reducer

// --- Selectors ---
export const selectProductItems = (state) => state.products.items
export const selectProductsStatus = (state) => state.products.status
export const selectProductsError = (state) => state.products.error
export const selectProductsFetchedAt = (state) => state.products.fetchedAt

// 商品詳情頁用：依 id 從目前的 items 裡找出單一商品（找不到回傳 undefined）。
export const selectProductById = (id) => (state) => state.products.items.find((item) => item.id === id)

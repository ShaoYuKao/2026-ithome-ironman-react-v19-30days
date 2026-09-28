// src/store/store.js
import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice.js'
import productsReducer from './productsSlice.js'
import userReducer from './userSlice.js'

// 對照 Day25 第四節對照表提過的 configureStore({ reducer: { cart, products, user } })：
// 今天終於用上三個 slice，各自獨立負責一塊資料，互不干涉。
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productsReducer,
    user: userReducer,
  },
})

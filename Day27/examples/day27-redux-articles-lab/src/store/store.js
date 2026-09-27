// src/store/store.js
import { configureStore } from '@reduxjs/toolkit'
import articlesReducer from './articlesSlice.js'

export const store = configureStore({
  reducer: {
    articles: articlesReducer,
  },
})

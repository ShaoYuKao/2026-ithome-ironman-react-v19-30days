import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// 每個測試結束後，把上一個測試 render 出來的 DOM 清乾淨，避免殘留的
// 畫面內容影響到下一個測試（例如兩個測試都用 getByRole 找同一種按鈕，
// 沒清乾淨就可能找到「上一個測試留下來的」元素）。
//
// 這一段本來是 React Testing Library 幫我們自動處理的，但因為 vitest.config
// 沒有開啟 `test.globals`，`afterEach` 不會被自動掛到全域環境，所以要在
// 這支「測試環境設定檔」裡手動註冊一次，之後所有測試檔案都會套用到。
afterEach(() => {
  cleanup()
})

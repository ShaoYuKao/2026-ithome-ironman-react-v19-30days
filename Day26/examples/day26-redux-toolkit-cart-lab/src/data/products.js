// products.js：今天的練習重點是 cartSlice 本身（Redux Toolkit 的用法），
// 不是「怎麼從後端 API 取得商品清單」——那件事要等 Day27 的 createAsyncThunk
// 才會處理，這裡先用固定的假資料，讓練習聚焦在購物車邏輯。
// image 欄位刻意只放 emoji（不是真的圖片檔），單純當作商品的視覺標示。
export const PRODUCTS = [
  { id: 'p01', name: '無線滑鼠', price: 590, image: '🖱️' },
  { id: 'p02', name: '機械式鍵盤', price: 1990, image: '⌨️' },
  { id: 'p03', name: 'USB-C 多合一擴充座', price: 1290, image: '🔌' },
  { id: 'p04', name: '27 吋 4K 顯示器', price: 8990, image: '🖥️' },
  { id: 'p05', name: '藍牙耳機', price: 990, image: '🎧' },
  { id: 'p06', name: '筆電支架', price: 690, image: '💻' },
]

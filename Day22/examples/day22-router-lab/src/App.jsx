import { RouterProvider } from 'react-router/dom'
import './App.css'
import { router } from './router.jsx'

// App：今天改成只負責把 router.jsx 建立好的路由設定，交給 RouterProvider
// 渲染——比對目前瀏覽器網址、決定要顯示哪個頁面元件，都是 RouterProvider
// 內部處理的事，App 本身不再需要知道任何頁面細節。
//
// RouterProvider 刻意從 'react-router/dom' 匯入（而不是 'react-router'）：
// 這是官方文件建議在瀏覽器（ReactDOM）環境下使用的版本，內部針對
// <Form>、捲動位置還原等瀏覽器專屬行為做了加強。
function App() {
  return <RouterProvider router={router} />
}

export default App

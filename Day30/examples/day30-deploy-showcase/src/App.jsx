import { RouterProvider } from 'react-router/dom'
import './App.css'
import { router } from './router.jsx'

// App：只負責把 router.jsx 建立好的路由設定交給 RouterProvider 渲染，
// 沿用 Day22 的寫法，RouterProvider 從 'react-router/dom' 匯入。
function App() {
  return <RouterProvider router={router} />
}

export default App

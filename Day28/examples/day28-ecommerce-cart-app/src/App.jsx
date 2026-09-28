import { RouterProvider } from 'react-router/dom'
import './App.css'
import { router } from './router.jsx'

// App：跟 Day22～Day24 一致，只負責把 router.jsx 建立好的路由設定交給
// RouterProvider 渲染；Redux 的 <Provider> 放在更外層的 main.jsx。
function App() {
  return <RouterProvider router={router} />
}

export default App

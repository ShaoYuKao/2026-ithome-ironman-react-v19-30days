import { RouterProvider } from 'react-router/dom'
import './App.css'
import { router } from './router.jsx'

// App：延續 Day22 的作法，只負責把 router.jsx 建立好的路由設定交給
// RouterProvider 渲染。今天路由設定本身變得比 Day22 複雜（多了巢狀路由），
// 但 App 這一層完全不受影響——這正是「路由設定」與「畫面組裝」分離的好處。
function App() {
  return <RouterProvider router={router} />
}

export default App

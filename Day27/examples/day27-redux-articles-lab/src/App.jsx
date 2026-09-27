import { RouterProvider } from 'react-router/dom'
import './App.css'
import { router } from './router.jsx'

// App：跟 Day22/Day23 一致，只負責把 router.jsx 建立好的路由設定交給
// RouterProvider 渲染；<Provider store={store}> 已經在 main.jsx 包好，
// 所以底下任何一個頁面都能直接用 useSelector／useDispatch。
function App() {
  return <RouterProvider router={router} />
}

export default App

// main.jsx（跟之前每天的結構一致，維持 StrictMode）
// 多了一層 <Provider store={store}>：這是 react-redux 提供的「橋樑」元件，
// 把 Day26 建立的 store 放進 React Context，App 底下任何層級的元件，
// 都能透過 useSelector／useDispatch 直接存取，不需要再手動一層層傳遞 props。
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { store } from './store/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

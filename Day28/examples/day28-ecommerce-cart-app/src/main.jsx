// main.jsx（跟 Day26／Day27 一致：多包一層 <Provider store={store}>，
// 讓 App 底下任何元件都能直接用 useSelector／useDispatch）
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

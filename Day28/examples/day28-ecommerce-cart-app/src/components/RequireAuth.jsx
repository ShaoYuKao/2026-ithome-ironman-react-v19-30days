import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../store/userSlice.js'

// RequireAuth：路由守衛，保護 `/checkout`。
//
// 跟 Day24 的 RequireAuth 幾乎一模一樣（同樣是「useEffect + 條件渲染」，
// 同樣不能在渲染過程中直接呼叫 navigate()、必須包在 useEffect 裡才是合法的
// side effect），唯一的差異是資料來源：Day24 讀的是
// useRouteLoaderData('root')（root 路由 loader 準備好的資料），今天讀的是
// useSelector(selectIsLoggedIn)（Redux store 的 user slice）。
//
// 為什麼今天不需要「root loader」這一層？因為 Redux store 本來就是獨立於
// 路由樹之外的全域單例，任何元件（不管巢狀在哪一層路由底下）都能直接用
// useSelector 讀到同一份登入狀態，不需要像 Day24 那樣額外設計一個 root
// 路由 loader 來讓資料「往下傳」。
function RequireAuth({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoggedIn) {
      // 把「原本想去的頁面」記錄在查詢字串 ?from=，登入成功後 LoginPage
      // 才能導回使用者原本想去的地方（今天固定會是 /checkout，但寫法保留
      // 彈性，跟 Day24 一致）。
      navigate(`/login?from=${encodeURIComponent(location.pathname)}`, { replace: true })
    }
  }, [isLoggedIn, navigate, location])

  // 條件渲染：還沒確認登入時，先不要把受保護的畫面渲染出來，避免使用者
  // 看到一閃而過的「受保護內容」（flash of protected content）。
  if (!isLoggedIn) {
    return <p className="empty-state">尚未登入，正在導向登入頁…</p>
  }

  return children
}

export default RequireAuth

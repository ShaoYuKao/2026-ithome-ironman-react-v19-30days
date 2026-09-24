import { useEffect } from 'react'
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router'

// RequireAuth：今天練習的重點——用「useEffect + 條件渲染」實作的路由守衛。
//
// 為什麼不能直接在渲染過程中呼叫 navigate()？
// navigate() 會改變瀏覽器網址、觸發別的元件重新渲染，這屬於「side
// effect（副作用）」。React 規定 side effect 只能寫在事件處理函式或
// useEffect 裡面執行，不能直接寫在元件本體（渲染過程）裡呼叫——這也是
// 為什麼下面一定要包一層 useEffect，而不是在 if 判斷式裡直接呼叫
// navigate()。
//
// 這裡的登入狀態是從 root 路由的 loader 資料（useRouteLoaderData）讀
// 出來的，跟 NavBar 讀的是同一份資料，兩邊永遠一致。
function RequireAuth({ children }) {
  const rootData = useRouteLoaderData('root')
  const user = rootData?.user ?? null
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
      // 把「原本想去的頁面」記錄在查詢字串 ?from=，登入成功後
      // LoginPage 才能導回使用者原本想去的地方，而不是每次都固定跳去
      // /dashboard。
      navigate(`/login?from=${encodeURIComponent(location.pathname)}`, { replace: true })
    }
  }, [user, navigate, location])

  // 條件渲染：還沒確認登入、或尚未登入時，先不要把受保護的畫面渲染
  // 出來，避免使用者看到一閃而過的「受保護內容」（俗稱 flash of
  // protected content）。
  if (!user) {
    return <p className="empty-state">尚未登入，正在導向登入頁…</p>
  }

  return children
}

export default RequireAuth

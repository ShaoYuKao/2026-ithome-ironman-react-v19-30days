import { NavLink } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { selectCartTotalCount } from '../store/cartSlice.js'
import { logout, selectCurrentUser } from '../store/userSlice.js'

// NavBar：今天整合的縮影——同一個元件裡，購物車圖示的數字用
// useSelector(selectCartTotalCount) 讀 cart slice，登入狀態用
// useSelector(selectCurrentUser) 讀 user slice，兩者互不相干，
// 卻能在同一個地方一起顯示，這正是「全域狀態」的意義：不需要
// 任何 props，任何元件都能直接訂閱它需要的那一小塊資料。
function NavBar() {
  const dispatch = useDispatch()
  const totalCount = useSelector(selectCartTotalCount)
  const currentUser = useSelector(selectCurrentUser)

  return (
    <nav className="nav-bar">
      <span className="nav-brand">Day 28 · 電商購物車 App</span>
      <ul className="nav-list">
        <li>
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
            首頁
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
            商品列表
          </NavLink>
        </li>
        <li>
          <NavLink to="/cart" className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
            🛒 購物車
            {totalCount > 0 && <span className="nav-badge">{totalCount}</span>}
          </NavLink>
        </li>
      </ul>

      <div className="nav-auth">
        {currentUser ? (
          <>
            <span className="nav-user">👤 {currentUser.name}</span>
            <button type="button" className="secondary-btn" onClick={() => dispatch(logout())}>
              登出
            </button>
          </>
        ) : (
          <NavLink to="/login" className="secondary-btn">
            登入
          </NavLink>
        )}
      </div>
    </nav>
  )
}

export default NavBar

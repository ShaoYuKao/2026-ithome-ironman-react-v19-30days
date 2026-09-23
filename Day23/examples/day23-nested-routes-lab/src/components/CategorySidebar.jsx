import { Link, useSearchParams } from 'react-router'
import { CATEGORIES } from '../categories.js'

// CategorySidebar：文章分類側欄，巢狀在 ArticlesLayout 底下，
// 所以「文章列表」與「文章詳情」兩個頁面都看得到同一份側欄
// ——這就是本篇「巢狀路由 + Outlet」想示範的共用 Layout 效果。
//
// 這裡刻意不用 <NavLink> 來判斷目前選取的分類：NavLink 的 isActive
// 只比對網址的 pathname，並不會考慮查詢字串（search / query string）。
// 分類是靠網址上的 `?category=` 決定，所以改成自己用 useSearchParams
// 讀出目前的查詢字串，手動判斷哪個分類「目前被選取」。
function CategorySidebar() {
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || ''

  return (
    <nav className="category-sidebar" aria-label="文章分類">
      <p className="category-sidebar__title">文章分類</p>
      <ul className="category-list">
        {CATEGORIES.map((category) => {
          const isActive = category.value === activeCategory
          return (
            <li key={category.value || 'all'}>
              <Link
                to={category.value ? `/articles?category=${category.value}` : '/articles'}
                className={`category-link${isActive ? ' category-link--active' : ''}`}
              >
                {category.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default CategorySidebar

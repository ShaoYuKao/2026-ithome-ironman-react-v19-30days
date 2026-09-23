import { Link } from 'react-router'
import { CATEGORIES } from '../categories.js'

// ArticleCard：文章列表裡的單張卡片，點擊會導向 `/articles/:id`
// 這個動態路由，對應到 ArticleDetailPage。
function ArticleCard({ article }) {
  const categoryLabel = CATEGORIES.find((c) => c.value === article.category)?.label ?? article.category

  return (
    <Link to={`/articles/${article.id}`} className="card article-card">
      <span className="badge">{categoryLabel}</span>
      <h2>{article.title}</h2>
      <p className="card-desc">{article.excerpt}</p>
      <p className="article-card__meta">
        {article.author} · {article.publishedAt}
      </p>
    </Link>
  )
}

export default ArticleCard

import { Link } from 'react-router'
import { CATEGORY_LABELS } from '../utils/articlesApi.js'

/** 文章列表裡的單張卡片，點擊「查看詳情」會用 <Link> 導向 /articles/:id。 */
function ArticleCard({ article, to }) {
  return (
    <article className="article-card">
      <div className="article-card__meta">
        <span className={`badge badge--${article.category}`}>{CATEGORY_LABELS[article.category]}</span>
        <span className="article-card__read-time">🕒 {article.readMinutes} 分鐘閱讀</span>
      </div>
      <h3>{article.title}</h3>
      <p className="article-card__excerpt">{article.excerpt}</p>
      <div className="article-card__footer">
        <span className="article-card__byline">
          ✍️ {article.author}・{article.publishedAt}
        </span>
        <Link to={to} className="btn">
          查看詳情 →
        </Link>
      </div>
    </article>
  )
}

export default ArticleCard

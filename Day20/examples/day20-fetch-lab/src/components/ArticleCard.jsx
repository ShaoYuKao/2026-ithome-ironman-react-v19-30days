import { CATEGORY_LABELS } from '../utils/articlesApi.js'

/** 文章列表裡的單張卡片，點擊「查看詳情」會通知父層切換右側詳情面板要顯示的文章。 */
function ArticleCard({ article, isSelected, onSelect }) {
  return (
    <article className={`article-card${isSelected ? ' article-card--selected' : ''}`}>
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
        <button type="button" className={isSelected ? 'btn btn--primary' : 'btn'} onClick={onSelect}>
          {isSelected ? '✅ 檢視中' : '查看詳情 →'}
        </button>
      </div>
    </article>
  )
}

export default ArticleCard

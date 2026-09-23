import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CATEGORIES } from '../categories.js'

// ArticleDetailPage：路由 "/articles/:articleId"。
//
// 重要觀念：從 "/articles/1" 換到 "/articles/2" 時，React Router 比對到
// 的是「同一筆」路由設定（都是 path: ':articleId'），只是 articleId 這個
// 參數值改變而已——並不會把 ArticleDetailPage 整個元件卸載、再重新掛載
// 一次。這代表如果 useEffect 沒有把 articleId 放進依賴陣列，畫面會停留
// 在「上一篇文章」抓到的資料，不會跟著網址一起換成新文章的內容
// （這是初學者很常踩到的 bug：以為換頁＝元件重新執行一次）。
//
// 實作細節——為什麼「載入中」不是用另一個 setState 同步宣告出來：
// 直覺的寫法會在 effect 一開始就呼叫 setState({ status: 'loading', ... })
// 重設狀態，但 oxlint 的 react/set-state-in-effect 規則會提醒這種寫法
// 每次 articleId 改變都會多觸發一次「用不到的中間渲染」。這裡改用
// Day21 useFetch.js 用過的技巧：把 result 記錄成「這筆結果屬於哪個
// articleId」，渲染時比對 result.articleId 是否等於目前的 articleId，
// 兩者不一致就代表「畫面現在看到的結果，還不是目前網址對應的文章」，
// 直接推導出是否要顯示載入中，effect 內完全不需要另外呼叫 setState
// 去「宣告」現在是載入中。
function ArticleDetailPage() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState({ articleId: null, article: null, error: null })

  useEffect(() => {
    let isActive = true

    fetch(`/api/articles/${articleId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message || `找不到文章（狀態碼 ${res.status}）`)
        }
        return res.json()
      })
      .then((data) => {
        if (isActive) setResult({ articleId, article: data, error: null })
      })
      .catch((error) => {
        if (isActive) setResult({ articleId, article: null, error: error.message })
      })

    return () => {
      isActive = false
    }
  }, [articleId]) // ✅ 一定要加 articleId：參數改變時才會重新抓取對應的文章

  const isLoading = result.articleId !== articleId

  if (isLoading) {
    return <p className="empty-state">文章載入中…</p>
  }

  if (result.error) {
    return (
      <div className="not-found">
        <h1>{result.error}</h1>
        <p className="subtitle">這篇文章可能不存在，或編號打錯了。</p>
        <Link to="/articles" className="secondary-btn">
          回文章列表
        </Link>
      </div>
    )
  }

  const { article } = result
  const categoryLabel = CATEGORIES.find((c) => c.value === article.category)?.label ?? article.category

  return (
    <article className="article-detail">
      {/* navigate(-1)：回到「進來這篇文章之前」的那一頁，會保留使用者
          原本設定的分類／關鍵字篩選；如果改用 navigate('/articles')，
          篩選條件會被重置成預設值，兩者行為並不相同。 */}
      <button type="button" className="secondary-btn" onClick={() => navigate(-1)}>
        ← 返回上一頁
      </button>

      <header className="page-header page-header--left">
        <p className="eyebrow">{categoryLabel}</p>
        <h1>{article.title}</h1>
        <p className="article-detail__meta">
          {article.author} · {article.publishedAt}
        </p>
      </header>

      <div className="article-detail__content">
        {article.content.split('\n\n').map((paragraph) => (
          <p key={paragraph.slice(0, 12)}>{paragraph}</p>
        ))}
      </div>

      <div className="article-detail__nav">
        <button
          type="button"
          className="secondary-btn"
          disabled={article.prevId === null}
          onClick={() => navigate(`/articles/${article.prevId}`)}
        >
          ← 上一篇
        </button>
        <button
          type="button"
          className="secondary-btn"
          disabled={article.nextId === null}
          onClick={() => navigate(`/articles/${article.nextId}`)}
        >
          下一篇 →
        </button>
      </div>
    </article>
  )
}

export default ArticleDetailPage

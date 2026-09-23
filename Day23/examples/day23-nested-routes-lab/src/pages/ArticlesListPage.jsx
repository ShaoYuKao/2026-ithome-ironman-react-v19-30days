import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import ArticleCard from '../components/ArticleCard.jsx'
import { CATEGORIES } from '../categories.js'

// ArticlesListPage：路由 "/articles"（ArticlesLayout 的 index 路由）。
// 只跟後端要一次「全部文章清單」，之後的分類篩選、關鍵字搜尋都在瀏覽器端
// 用 .filter() 完成——不需要每次篩選條件改變就重新打一次 API，這也是
// 為什麼下面的 useEffect 依賴陣列是空陣列（只在第一次進入頁面時抓取）。
function ArticlesListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [state, setState] = useState({ status: 'loading', articles: [], error: '' })

  // 分類與關鍵字都直接從網址的查詢字串讀出，網址就是「目前篩選條件」
  // 唯一的資料來源（source of truth），重新整理頁面、分享連結給別人，
  // 篩選結果都會維持一致。
  const category = searchParams.get('category') || ''
  const keyword = searchParams.get('q') || ''

  useEffect(() => {
    let ignore = false

    fetch('/api/articles')
      .then((res) => {
        if (!res.ok) throw new Error(`API 回應錯誤（狀態碼 ${res.status}）`)
        return res.json()
      })
      .then((data) => {
        if (!ignore) setState({ status: 'success', articles: data.articles, error: '' })
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', articles: [], error: error.message })
      })

    return () => {
      ignore = true
    }
  }, [])

  function handleKeywordChange(event) {
    const value = event.target.value

    // { replace: true }：搜尋框每敲一個字就會呼叫一次 setSearchParams，
    // 如果不加 replace，瀏覽器的「上一頁」紀錄會被每一個字都塞一筆，
    // 按一次上一頁只會消掉一個字，體驗很差。加上 replace 之後，同一次
    // 輸入只會覆蓋目前這一筆歷史紀錄，不會一直新增。
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set('q', value)
        } else {
          next.delete('q')
        }
        return next
      },
      { replace: true },
    )
  }

  function handleClearFilters() {
    setSearchParams({})
  }

  const filteredArticles = state.articles.filter((article) => {
    const matchCategory = !category || article.category === category
    const matchKeyword =
      !keyword ||
      article.title.toLowerCase().includes(keyword.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(keyword.toLowerCase())
    return matchCategory && matchKeyword
  })

  const activeCategoryLabel = CATEGORIES.find((c) => c.value === category)?.label ?? '全部文章'

  return (
    <div className="articles-list-page">
      <header className="page-header page-header--left">
        <p className="eyebrow">文章列表</p>
        <h1>所有文章</h1>
        <p className="subtitle">
          目前分類：<strong>{activeCategoryLabel}</strong>
          {keyword && (
            <>
              ，關鍵字：<strong>「{keyword}」</strong>
            </>
          )}
        </p>
      </header>

      <div className="search-bar">
        <input
          type="search"
          className="form-input"
          placeholder="搜尋文章標題或摘要……"
          value={keyword}
          onChange={handleKeywordChange}
        />
        <button type="button" className="secondary-btn" onClick={handleClearFilters}>
          清除篩選
        </button>
      </div>

      {state.status === 'loading' && <p className="empty-state">文章載入中…</p>}
      {state.status === 'error' && <p className="empty-state">載入失敗：{state.error}</p>}

      {state.status === 'success' && filteredArticles.length === 0 && (
        <p className="empty-state">沒有符合條件的文章，試試看清除篩選條件。</p>
      )}

      {state.status === 'success' && filteredArticles.length > 0 && (
        <div className="card-grid">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ArticlesListPage

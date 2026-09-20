import { useState } from 'react'
import ArticleListPage from './ArticleListPage.jsx'
import ArticleDetailPanel from './ArticleDetailPanel.jsx'

/**
 * 今天的頁面骨架：左側文章列表、右側文章詳情，兩者都各自呼叫一次
 * useFetch，但共用同一個 selectedId 狀態決定「目前要看哪一篇」。
 */
function FetchLab() {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <div className="fetch-lab">
      <ArticleListPage selectedId={selectedId} onSelectArticle={setSelectedId} />
      <ArticleDetailPanel articleId={selectedId} onSelectArticle={setSelectedId} />
    </div>
  )
}

export default FetchLab

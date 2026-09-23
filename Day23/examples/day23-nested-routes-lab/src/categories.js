// 文章分類清單：CategorySidebar、ArticleCard、ArticlesListPage、
// ArticleDetailPage 都會用到，集中放在獨立檔案管理，避免每個元件檔案
// 各自重複宣告一份，也讓元件檔案維持「只匯出元件」（Fast Refresh 友善）。
export const CATEGORIES = [
  { value: '', label: '全部文章' },
  { value: 'react', label: 'React' },
  { value: 'router', label: 'React Router' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'vite', label: 'Vite' },
]

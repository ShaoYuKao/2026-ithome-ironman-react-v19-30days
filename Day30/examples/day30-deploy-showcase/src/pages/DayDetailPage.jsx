import { Link, useNavigate, useParams } from 'react-router'
import { buildDayReadmeUrl, learningDays } from '../data/learningDays.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

// DayDetailPage：路由 "/days/:dayNumber" 對應的頁面。
// useParams() 取出網址上的 :dayNumber（一定是字串，所以要自己轉成數字），
// 對照 Day23「巢狀路由與動態參數」教過的用法。
function DayDetailPage() {
  const { dayNumber } = useParams()
  const navigate = useNavigate()
  const [progress, setProgress] = useLocalStorage('day30-progress', {})

  const day = Number(dayNumber)
  const index = learningDays.findIndex((item) => item.day === day)
  const current = learningDays[index]

  // 找不到對應天數（例如網址被手動改成 /days/999）時，不整頁導向 404，
  // 而是在同一個頁面裡顯示提示——這是 Day6 學過的「條件渲染」，
  // 用來處理「網址格式正確、但資料不存在」這種情境。
  if (!current) {
    return (
      <div className="page-inner">
        <div className="not-found">
          <p className="not-found__code">?</p>
          <h1>找不到 Day {dayNumber}</h1>
          <p className="subtitle">30 天課程只到 Day 30，請確認網址上的天數是否正確。</p>
          <Link to="/" className="secondary-btn">
            回首頁
          </Link>
        </div>
      </div>
    )
  }

  const prevDay = learningDays[index - 1]
  const nextDay = learningDays[index + 1]
  const isReviewed = Boolean(progress[current.day])

  function toggleReviewed() {
    setProgress((prev) => ({ ...prev, [current.day]: !prev[current.day] }))
  }

  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">{current.week}</p>
        <h1>
          Day {current.day}｜{current.title}
        </h1>
      </header>

      <section className="card day-detail">
        <label className="checkbox-label">
          <input type="checkbox" checked={isReviewed} onChange={toggleReviewed} />
          標記為已回顧
        </label>

        <a
          className="secondary-btn"
          href={buildDayReadmeUrl(current.day)}
          target="_blank"
          rel="noreferrer"
        >
          在 GitHub 上閱讀完整教學文件 ↗
        </a>
        <p className="form-hint">
          這個連結由環境變數 <code>VITE_GITHUB_REPO_URL</code> 組合而成（見 <code>.env</code>），
          換成自己的 GitHub 帳號後，不需要修改任何 JavaScript 程式碼就能指向正確位置。
        </p>
      </section>

      <div className="day-detail__nav">
        <button
          type="button"
          className="secondary-btn"
          disabled={!prevDay}
          onClick={() => navigate(`/days/${prevDay.day}`)}
        >
          ← {prevDay ? `Day ${prevDay.day}` : '已經是第一天'}
        </button>
        <button
          type="button"
          className="secondary-btn"
          disabled={!nextDay}
          onClick={() => navigate(`/days/${nextDay.day}`)}
        >
          {nextDay ? `Day ${nextDay.day}` : '已經是最後一天'} →
        </button>
      </div>
    </div>
  )
}

export default DayDetailPage

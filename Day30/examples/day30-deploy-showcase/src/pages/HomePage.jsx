import { Link } from 'react-router'
import { learningDays } from '../data/learningDays.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

// 把 30 天資料依照 week 欄位分組，畫面上才能一週一週分段顯示。
// reduce 把陣列變成 { [週次]: [day, day, ...] } 的物件，是 Day6「列表渲染」
// 學過的 .map() 之外，另一個很常用的陣列整理技巧。
function groupByWeek(days) {
  return days.reduce((groups, item) => {
    const list = groups[item.week] ?? []
    list.push(item)
    groups[item.week] = list
    return groups
  }, {})
}

// HomePage：路由 "/" 對應的首頁。
// 用 useLocalStorage 保存「哪些天數已標記為已回顧」，畫面重新整理、
// 或從 DayDetailPage 切回首頁，進度依然保留（因為讀寫的是同一個 key）。
function HomePage() {
  const [progress, setProgress] = useLocalStorage('day30-progress', {})
  const grouped = groupByWeek(learningDays)
  const completedCount = Object.values(progress).filter(Boolean).length
  const percent = Math.round((completedCount / learningDays.length) * 100)

  function toggleDay(day) {
    setProgress((prev) => ({ ...prev, [day]: !prev[day] }))
  }

  return (
    <div className="page-inner">
      <header className="page-header">
        <p className="eyebrow">{import.meta.env.VITE_APP_TITLE}</p>
        <h1>30 天學習歷程展示牆</h1>
        <p className="subtitle">
          把 <code>plan03.md</code> 的 30 天課程整理成一份可以打包、部署到任何靜態託管平台的
          React 專案：勾選「已回顧」可以記錄自己的複習進度（存在瀏覽器的 localStorage 裡），
          點擊卡片可以前往每一天的介紹頁面。
        </p>
      </header>

      <section className="progress-summary">
        <p>
          學習進度：<strong>{completedCount}</strong> / {learningDays.length} 天已回顧（
          {percent}%）
        </p>
        <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </section>

      {Object.entries(grouped).map(([week, days]) => (
        <section key={week} className="week-section">
          <h2 className="week-heading">{week}</h2>
          <div className="day-grid">
            {days.map((item) => (
              <div key={item.day} className="day-card">
                <div className="day-card__top">
                  <span className="day-badge">Day {item.day}</span>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={Boolean(progress[item.day])}
                      onChange={() => toggleDay(item.day)}
                    />
                    已回顧
                  </label>
                </div>
                <Link to={`/days/${item.day}`} className="day-card__title">
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default HomePage

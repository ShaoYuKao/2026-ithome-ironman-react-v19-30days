// SummaryStats：純粹用 tasks / contacts / notes 三個陣列的長度，算出三張摘要卡片。
// 這些都是「render 當下直接算」的衍生值，資料量小、計算成本低，
// 不需要用到 Day15 才會教的 useMemo 快取——先養成「衍生值不用另外存 state」的習慣，
// 之後遇到真正昂貴的計算時，再學怎麼用 useMemo 優化。
function SummaryStats({ tasks, contacts, notes }) {
  const remainingTasks = tasks.filter((task) => !task.completed).length

  return (
    <section className="summary-stats">
      <div className="summary-card">
        <p className="summary-value">{remainingTasks}</p>
        <p className="summary-label">待完成任務</p>
      </div>
      <div className="summary-card">
        <p className="summary-value">{contacts.length}</p>
        <p className="summary-label">聯絡人</p>
      </div>
      <div className="summary-card">
        <p className="summary-value">{notes.length}</p>
        <p className="summary-label">筆記</p>
      </div>
    </section>
  )
}

export default SummaryStats

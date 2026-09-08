function LogPanel({ title, entries, onClear }) {
  return (
    <div className="log-panel">
      <div className="log-panel__header">
        <span className="log-panel__title">{title}</span>
        {/* && 寫法（Day06 複習）：只有真的有紀錄時，才顯示「清空紀錄」按鈕 */}
        {entries.length > 0 && (
          <button type="button" className="log-clear-btn" onClick={onClear}>
            清空紀錄
          </button>
        )}
      </div>

      {/* 提早 return 的概念在這裡改用三元運算子：沒有任何紀錄時顯示提示文字 */}
      {entries.length === 0 ? (
        <p className="log-empty">（尚無紀錄，操作看看上面的按鈕吧）</p>
      ) : (
        <ul className="log-list">
          {entries.map((entry) => (
            <li key={entry.id} className={`log-item log-item--${entry.type ?? 'default'}`}>
              <span className="log-time">{entry.time}</span>
              <span className="log-text">{entry.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LogPanel

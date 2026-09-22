import { useLocalStorage } from '../hooks/index.js'

const DEFAULT_NOTE = {
  title: '',
  content: '',
}

// LocalStorageDemo：一個會自動保存的「單則便利貼」，用來展示
// useLocalStorage 讓「畫面狀態」與「持久化儲存」合而為一的效果——
// 元件內完全看不到任何 localStorage.getItem / setItem 或 JSON.parse /
// JSON.stringify，這些細節都被封裝在 Hook 內部了。
function LocalStorageDemo() {
  const [note, setNote] = useLocalStorage('day22-sticky-note', DEFAULT_NOTE)
  // 同一個 Hook、同一個檔案，也可以在同一個元件裡再呼叫第二次、存不同的
  // key、存不同形狀的資料（這裡存的是數字），驗證「可重複使用」不只是
  // 口號，而是同一份程式碼真的能被安全地多次呼叫。
  const [visitCount, setVisitCount] = useLocalStorage('day22-visit-count', 0)

  function updateField(key, value) {
    setNote((prev) => ({ ...prev, [key]: value }))
  }

  function handleClear() {
    setNote(DEFAULT_NOTE)
  }

  return (
    <section className="card">
      <h2>useLocalStorage：會自動保存的便利貼</h2>
      <p className="card-desc">
        延續自 Day13、Day21，把 <code>useState</code> 換成{' '}
        <code>useLocalStorage(key, initialValue)</code> 就完成了持久化——
        在下面輸入內容後重新整理頁面（或關掉分頁再打開），內容依然會保留。
        「造訪次數」則示範同一個 Hook 可以在同一個元件裡，管理完全不同形狀的另一份資料。
      </p>

      <label className="form-label" htmlFor="note-title">
        便利貼標題
      </label>
      <input
        id="note-title"
        type="text"
        className="form-input"
        value={note.title}
        onChange={(event) => updateField('title', event.target.value)}
        placeholder="例如：明天要記得的事"
      />

      <label className="form-label" htmlFor="note-content">
        便利貼內容
      </label>
      <textarea
        id="note-content"
        className="form-input"
        rows={3}
        value={note.content}
        onChange={(event) => updateField('content', event.target.value)}
        placeholder="輸入完整內容……"
      />

      <div className="live-echo">
        目前儲存的內容：<code>{JSON.stringify(note)}</code>
      </div>

      <div className="button-row">
        <button type="button" className="secondary-btn" onClick={handleClear}>
          清空便利貼
        </button>
        <button type="button" className="secondary-btn" onClick={() => setVisitCount((count) => count + 1)}>
          造訪次數 +1（目前：{visitCount}）
        </button>
      </div>
    </section>
  )
}

export default LocalStorageDemo

import { useState } from 'react'

let seed = 3
const initialItems = [
  { id: 1, label: '項目 A' },
  { id: 2, label: '項目 B' },
  { id: 3, label: '項目 C' },
]

function KeyPitfallDemo() {
  const [items, setItems] = useState(initialItems)

  function handleInsertFront() {
    seed += 1
    const nextLabel = `項目 ${String.fromCharCode(64 + seed)}`
    setItems((prev) => [{ id: seed, label: nextLabel }, ...prev])
  }

  function handleReset() {
    seed = 3
    setItems(initialItems)
  }

  return (
    <section className="card key-demo">
      <h2>🔑 額外示範：key 為什麼很重要？</h2>
      <p className="card-desc">
        先在左右兩份清單的輸入框裡都打幾個字（例如在「項目 A」那一列打 <code>hello</code>），
        接著點擊「在最前面插入一筆」，觀察哪一份清單的輸入內容跟著文字標籤一起往下移動（正確），
        哪一份清單的輸入內容卻留在原本的位置、變成對不上標籤的內容（錯誤）。
      </p>

      <div className="key-demo-actions">
        <button type="button" className="todo-add-btn" onClick={handleInsertFront}>
          在最前面插入一筆
        </button>
        <button type="button" className="todo-reset-btn" onClick={handleReset}>
          重設示範
        </button>
      </div>

      <div className="key-demo-grid">
        <div className="key-demo-column">
          <h3>❌ 用陣列 index 當 key</h3>
          {/* 錯誤示範：key={index}。插入新項目後，所有舊項目的 index 都會往後挪一位，
              React 會依照 key 去比對新舊節點，index 對得上就當成同一個節點直接沿用，
              於是輸入框裡「打過字」的 DOM 節點被錯誤地留在原本的 index 位置上，
              沒有跟著正確的資料一起移動。 */}
          <ul className="key-demo-list">
            {items.map((item, index) => (
              <li key={index} className="key-demo-item">
                <span>{item.label}</span>
                <input type="text" defaultValue="" placeholder="在這裡打字試試" />
              </li>
            ))}
          </ul>
        </div>

        <div className="key-demo-column">
          <h3>✅ 用穩定的 id 當 key</h3>
          {/* 正確示範：key={item.id}。id 是資料本身固定不變的識別碼，
              不會因為陣列順序改變而跟著變化，React 才能正確辨認「這是同一筆資料」，
              讓對應的 DOM 節點（以及裡面打過的字）跟著資料一起移動。 */}
          <ul className="key-demo-list">
            {items.map((item) => (
              <li key={item.id} className="key-demo-item">
                <span>{item.label}</span>
                <input type="text" defaultValue="" placeholder="在這裡打字試試" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default KeyPitfallDemo

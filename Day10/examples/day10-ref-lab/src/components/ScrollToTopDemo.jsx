import { useRef, useState } from 'react'

// 實驗二：捲動到頂部 / 捲動到指定項目（useRef 操作 DOM 節點的另一個常見情境）
//
// 核心觀念：
// 1. 幫「可捲動的容器」加上 ref，就能呼叫 element.scrollTo({ top, behavior: 'smooth' })
//    讓瀏覽器用平滑動畫捲動到指定位置，而不是瞬間跳過去。
// 2. 幫「清單裡的某一個項目」加上 ref，就能呼叫 element.scrollIntoView({ behavior, block })
//    讓瀏覽器自動幫我們算出「要捲動到哪裡，這個項目才會出現在畫面中」，不用自己計算座標。
const TOTAL_ITEMS = 40

function ScrollToTopDemo() {
  const [highlightIndex, setHighlightIndex] = useState(null)
  const [jumpTarget, setJumpTarget] = useState('20')

  // 捲動容器本身的 DOM 節點
  const scrollContainerRef = useRef(null)
  // 每一個清單項目的 DOM 節點，用一個一般物件依 index 存放（不需要觸發渲染，用 ref 最適合）
  const itemRefs = useRef({})

  function handleScrollToTop() {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleScrollToBottom() {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }

  function handleJumpToItem(event) {
    event.preventDefault()
    const index = Number(jumpTarget)
    if (!Number.isInteger(index) || index < 1 || index > TOTAL_ITEMS) {
      return
    }

    // scrollIntoView：瀏覽器自動計算「要把捲動容器捲到哪個位置，這個節點才會進入可視範圍」，
    // block: 'center' 表示盡量把目標項目捲到容器「垂直置中」的位置。
    itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightIndex(index)
  }

  return (
    <section className="card">
      <h2>2️⃣ 捲動到頂部 / 捲動到指定項目</h2>
      <p className="card-desc">
        一個裝了 {TOTAL_ITEMS} 筆資料的可捲動清單：「捲動到頂部」「捲動到底部」示範對捲動容器呼叫{' '}
        <code>scrollTo()</code>；輸入編號後按「跳到該項目」，示範對清單裡「某一個特定項目」呼叫{' '}
        <code>scrollIntoView()</code>，兩者都是先用 <code>useRef</code> 取得 DOM 節點，才能呼叫瀏覽器原生的捲動
        API。
      </p>

      <div className="button-row">
        <button type="button" className="secondary-btn" onClick={handleScrollToTop}>
          ⬆️ 捲動到頂部
        </button>
        <button type="button" className="secondary-btn" onClick={handleScrollToBottom}>
          ⬇️ 捲動到底部
        </button>
      </div>

      <form className="jump-form" onSubmit={handleJumpToItem}>
        <label className="form-label" htmlFor="jump-target">
          跳到第幾項（1～{TOTAL_ITEMS}）
        </label>
        <div className="jump-form-row">
          <input
            id="jump-target"
            type="number"
            className="form-input"
            min={1}
            max={TOTAL_ITEMS}
            value={jumpTarget}
            onChange={(event) => setJumpTarget(event.target.value)}
          />
          <button type="submit" className="secondary-btn">
            跳到該項目
          </button>
        </div>
      </form>

      <div className="scroll-box" ref={scrollContainerRef}>
        {Array.from({ length: TOTAL_ITEMS }, (_, i) => i + 1).map((itemNumber) => (
          <div
            key={itemNumber}
            // 把每一個項目的 DOM 節點存進 itemRefs.current，key 用項目編號，
            // 這樣「跳到第幾項」按鈕才知道要對哪一個節點呼叫 scrollIntoView()。
            ref={(element) => {
              itemRefs.current[itemNumber] = element
            }}
            className={`scroll-item ${highlightIndex === itemNumber ? 'scroll-item--highlight' : ''}`}
          >
            第 {itemNumber} 項資料
          </div>
        ))}
      </div>
    </section>
  )
}

export default ScrollToTopDemo

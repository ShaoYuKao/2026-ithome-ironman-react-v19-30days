import { useEffect, useRef, useState } from 'react'

// 實驗三：量測 DOM 節點的實際尺寸（useRef 操作 DOM 節點的第三種常見情境）
//
// 核心觀念：
// 1. getBoundingClientRect() 是瀏覽器原生 DOM API，能讀出一個元素「實際渲染出來」的寬高、
//    座標位置，這些資訊只有真正畫到畫面上之後才會知道，JavaScript 沒辦法用算的（要考慮字型、
//    換行、內距、外部 CSS 等因素），所以一定要透過 ref 拿到 DOM 節點之後才能呼叫。
// 2. 內容改變（文字變多變少）或視窗大小改變，都可能讓元素的實際尺寸跟著變化，
//    所以量測時機通常是：每次重新渲染之後（用 useEffect，不帶依賴或依賴內容），
//    以及監聽 window 的 resize 事件（記得在 cleanup 移除監聽，避免記憶體洩漏，Day08 學過的觀念）。
const SAMPLE_TEXT =
  '這是一段用來測試方塊尺寸的示範文字，會隨著點擊「增加內容」按鈕不斷變長，讓下方方塊因為文字換行而長高。'

function MeasureSizeDemo() {
  const [repeatCount, setRepeatCount] = useState(1)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const boxRef = useRef(null)

  useEffect(() => {
    function measure() {
      if (!boxRef.current) return
      // getBoundingClientRect() 回傳的 width / height 是「目前實際渲染出來」的尺寸（含內距、邊框）。
      const rect = boxRef.current.getBoundingClientRect()
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height) })
    }

    // 內容筆數改變（repeatCount）會讓方塊高度跟著變化，先量測一次目前的尺寸。
    measure()

    // 視窗寬度改變，方塊的寬度也可能因為版面 (layout) 重新排列而改變，一併監聽 resize 事件重新量測。
    window.addEventListener('resize', measure)

    // cleanup 函式：元件卸載或下一次 effect 執行前，先把這一次註冊的監聽器移除，
    // 避免視窗一直疊加監聽器造成不必要的重複執行（同 Day08 計時器 cleanup 的道理）。
    return () => {
      window.removeEventListener('resize', measure)
    }
  }, [repeatCount])

  return (
    <section className="card">
      <h2>3️⃣ 量測 DOM 節點的尺寸</h2>
      <p className="card-desc">
        點擊下方按鈕增加或減少方塊裡的文字內容，方塊的實際寬高會跟著文字換行而改變，透過{' '}
        <code>boxRef.current.getBoundingClientRect()</code> 即時讀出「目前真正渲染出來」的寬高，
        也試著調整瀏覽器視窗寬度，觀察 resize 事件觸發後尺寸是否重新量測。
      </p>

      <div className="button-row">
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setRepeatCount((c) => Math.min(c + 1, 6))}
        >
          增加內容
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setRepeatCount((c) => Math.max(c - 1, 1))}
        >
          減少內容
        </button>
      </div>

      <div className="measure-box" ref={boxRef}>
        {Array.from({ length: repeatCount }, (_, i) => (
          <p key={i}>{SAMPLE_TEXT}</p>
        ))}
      </div>

      <p className="live-echo">
        目前量測到的尺寸：寬 <strong>{size.width}px</strong>，高 <strong>{size.height}px</strong>
      </p>
    </section>
  )
}

export default MeasureSizeDemo

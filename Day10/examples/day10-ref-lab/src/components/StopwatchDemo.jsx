import { useEffect, useRef, useState } from 'react'

// 實驗五：碼表（Stopwatch）—— 用 useRef 保存計時器 ID，以及保存「前一次的值」
//
// 核心觀念：
// 1. setInterval() 回傳的計時器 ID，只是用來之後呼叫 clearInterval() 時指定「要清除哪一個」，
//    它本身「不需要」顯示在畫面上，改變它也不應該觸發重新渲染，所以是 useRef 的典型使用情境
//    ——如果誤用 useState 存這個 ID，每次重新建立計時器都會多一次不必要的渲染。
// 2. 「記錄一圈」時，需要知道「上一次記錄當下」經過了多少時間，才能算出這一圈花了多久，
//    這個「上一次的數值」同樣不需要顯示在畫面上（畫面顯示的是算好的「這一圈花費時間」），
//    只是計算用的中繼資料，也很適合用 useRef 保存。
function formatSeconds(ms) {
  return (ms / 1000).toFixed(1) + ' 秒'
}

function StopwatchDemo() {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [running, setRunning] = useState(false)
  const [lastLapMs, setLastLapMs] = useState(null)

  // 保存 setInterval 的計時器 ID，只在 handleReset / effect 的 cleanup 裡讀取，
  // 不需要顯示在畫面上，也不希望它的改變觸發重新渲染，所以用 useRef 而不是 useState。
  const intervalIdRef = useRef(null)

  // 保存「上一次記錄一圈時」的總經過時間，用來算出「這一圈」實際花了多久。
  const previousLapMs = useRef(0)

  useEffect(() => {
    if (!running) {
      return undefined
    }

    // 每 100ms 增加一次經過時間，用 setInterval 而不是 setTimeout 遞迴，維持簡單易懂。
    intervalIdRef.current = setInterval(() => {
      setElapsedMs((prev) => prev + 100)
    }, 100)

    // cleanup：running 變成 false（暫停）或元件卸載時，把這一次建立的計時器清除掉，
    // 避免背景一直疊加多個計時器（同 Day08 useEffect 清除函式的觀念）。
    return () => {
      clearInterval(intervalIdRef.current)
    }
  }, [running])

  function handleStartPause() {
    setRunning((prev) => !prev)
  }

  function handleReset() {
    setRunning(false)
    setElapsedMs(0)
    setLastLapMs(null)
    previousLapMs.current = 0
  }

  function handleLap() {
    const lapDuration = elapsedMs - previousLapMs.current
    setLastLapMs(lapDuration)
    previousLapMs.current = elapsedMs
  }

  return (
    <section className="card">
      <h2>5️⃣ 碼表：保存計時器 ID 與前一次的值</h2>
      <p className="card-desc">
        「開始 / 暫停」控制 <code>setInterval</code> 的建立與清除，計時器 ID 存在{' '}
        <code>intervalIdRef</code> 裡；「記錄一圈」則利用 <code>previousLapMs</code> 這個 ref
        保存「上一次記錄當下」的總時間，兩者都是「需要保留、但不需要顯示在畫面上」的資料，
        更新它們都不會、也不需要觸發重新渲染。
      </p>

      <p className="stopwatch-display">{formatSeconds(elapsedMs)}</p>

      <div className="button-row">
        <button type="button" className="secondary-btn" onClick={handleStartPause}>
          {running ? '⏸ 暫停' : '▶️ 開始'}
        </button>
        <button type="button" className="secondary-btn" onClick={handleLap} disabled={!running}>
          🏁 記錄一圈
        </button>
        <button type="button" className="secondary-btn" onClick={handleReset}>
          🔄 重置
        </button>
      </div>

      {lastLapMs !== null && (
        <p className="live-echo">
          上一圈花費時間：<strong>{formatSeconds(lastLapMs)}</strong>
        </p>
      )}
    </section>
  )
}

export default StopwatchDemo

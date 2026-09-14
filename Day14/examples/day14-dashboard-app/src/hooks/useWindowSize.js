// useWindowSize：同樣延續 Day13 的自訂 Hook，訂閱瀏覽器 resize 事件並回傳目前視窗尺寸。
//
// 今天用在 TabBar 上：視窗夠寬時，分頁按鈕同時顯示圖示與文字；
// 視窗窄到一定程度（例如手機畫面）時，自動只顯示圖示，讓分頁列在小螢幕也不會被文字撐爆版面。
import { useEffect, useState } from 'react'

function getSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function useWindowSize() {
  const [size, setSize] = useState(getSize)

  useEffect(() => {
    function handleResize() {
      setSize(getSize())
    }

    window.addEventListener('resize', handleResize)

    // 清除函式（Day08）：元件卸載時務必移除監聽器，避免記憶體洩漏。
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

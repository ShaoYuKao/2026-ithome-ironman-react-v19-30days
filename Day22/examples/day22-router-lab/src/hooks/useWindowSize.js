// useWindowSize：延續自 Day13，把「訂閱瀏覽器 resize 事件、記錄目前視窗
// 尺寸、元件卸載時記得移除監聽器」這一整套邏輯抽成自訂 Hook，讓任何需要
// 知道目前視窗尺寸的元件，都只需要呼叫 useWindowSize() 一行就好，今天
// 原封不動收錄進「自訂 Hook 函式庫」裡。
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

    // 清除函式（Day08 學過的觀念）：元件卸載時，一定要移除監聽器，
    // 否則即使元件已經從畫面上消失，這個事件處理函式仍然會繼續被觸發。
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

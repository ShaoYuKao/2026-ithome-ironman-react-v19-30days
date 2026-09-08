import { useEffect } from 'react'

function Greeting({ onLog }) {
  useEffect(() => {
    onLog('🟢 掛載（Mount）元件出現：Greeting 已經加入畫面，適合寫初始化、訂閱的程式碼', 'mount')

    // 元件卸載（Unmount）前會呼叫這個清除函式：近似 class component 的 componentWillUnmount，
    // 適合寫取消訂閱、清除計時器等「收尾」的程式碼。
    return () => {
      onLog('🔴 卸載（Unmount）元件消失：開始清除 Greeting 使用的資源，適合寫取消訂閱、清除資源的程式碼', 'cleanup')
    }
    // 這裡刻意只用空陣列 []，不把 onLog 放進依賴陣列：
    // onLog 雖然每次由父元件重新渲染時都會拿到新的函式參照，但它內部只呼叫
    // setLogs(prev => ...) 這種函式式更新，不論呼叫的是哪一個版本的 onLog，
    // 效果都相同，因此這是可以放心省略依賴項的例外情況（詳見 README 說明）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <p className="greeting-box">👋 哈囉，我是 Greeting 子元件！</p>
}

export default Greeting

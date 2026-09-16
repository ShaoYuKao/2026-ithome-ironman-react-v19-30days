import { useEffect, useState } from 'react'

/**
 * 純粹用來「驗證」用的小工具，跟今天的教學重點（useId）本身無關：
 * 掃描 containerRef 底下所有帶有 id 的元素，統計有沒有重複的 id，
 * 讓「useId 產生的 id 是唯一的」「寫死的 id 會撞名」這件事，
 * 不只是用眼睛看，而是有實際的偵測結果可以驗收。
 *
 * 這個檔案刻意把「相依陣列」設計成由呼叫端透過參數（deps）傳進來，
 * 是自訂 Hook 常見的寫法（例如轉發給內部的 useEffect／useMemo）。
 * 靜態分析工具沒辦法確認「一個變數」一定是合法、完整的相依陣列，
 * 因此下面用整個檔案停用 react-hooks/exhaustive-deps，並非真的忽略了相依關係。
 */
/* eslint-disable react-hooks/exhaustive-deps */

export function useDuplicateIdReport(containerRef, deps = []) {
  const [duplicates, setDuplicates] = useState([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const counts = new Map()
    container.querySelectorAll('[id]').forEach((el) => {
      counts.set(el.id, (counts.get(el.id) ?? 0) + 1)
    })

    setDuplicates([...counts.entries()].filter(([, count]) => count > 1))
  }, deps)

  return duplicates
}

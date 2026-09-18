import { useEffect, useOptimistic, useState } from 'react'
import SubmitButton from './SubmitButton.jsx'
import { fetchComments, postComment } from '../utils/api.js'

const NETWORK_MODES = [
  { value: 'normal', label: '✅ 正常（約 0.7 秒）' },
  { value: 'slow', label: '🐢 較慢（約 2.6 秒）' },
  { value: 'fail', label: '❌ 模擬伺服器拒絕' },
]

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('zh-TW', { hour12: false })
}

/**
 * CommentBoard：「送出留言即樂觀顯示，稍後才由伺服器結果覆蓋」的留言板。
 *
 * 核心資料流：
 * - comments：「真正的」留言清單，只有在伺服器回應成功之後才會被更新。
 * - optimisticComments：useOptimistic(comments, reducer) 算出來的「畫面上
 *   實際顯示」的清單——沒有任何 Action 在跑的時候，跟 comments 完全一樣；
 *   一旦呼叫了 addOptimisticComment，會立刻多出一筆帶著 pending: true 的
 *   暫時資料，等這次的 Action（commentFormAction）整個執行完，才會恢復成
 *   單純反映 comments 的樣子。
 */
function CommentBoard() {
  const [comments, setComments] = useState([])
  const [loadStatus, setLoadStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [networkMode, setNetworkMode] = useState('normal')
  const [lastFailure, setLastFailure] = useState(null)

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment) => [...state, newComment],
  )

  // 掛載時讀取一次留言清單（Day08 useEffect + Day20 才會學到的 fetch 三態）。
  useEffect(() => {
    let ignore = false
    fetchComments()
      .then(({ comments: initialComments }) => {
        if (ignore) return
        setComments(initialComments)
        setLoadStatus('ready')
      })
      .catch(() => {
        if (ignore) return
        setLoadStatus('error')
      })
    return () => {
      ignore = true
    }
  }, [])

  // commentFormAction 直接傳給 <form action={...}>，沒有經過 useActionState
  // 包裝——這是刻意的對照組：不是每個 Action 都需要 useActionState，如果
  // 不需要它幫你保管「上一次執行結果」，直接把 async 函式傳給 action prop，
  // 一樣會被 React 自動視為 Action（自動包成 transition、自動追蹤 pending）。
  async function commentFormAction(formData) {
    const name = (formData.get('name') ?? '').toString().trim() || '匿名訪客'
    const message = (formData.get('message') ?? '').toString().trim()
    if (!message) return

    setLastFailure(null)

    // 立刻樂觀顯示這則留言——這個當下，comments（真正的 state）根本還沒有變，
    // optimisticComments 卻已經多了這一筆，畫面上會馬上看到它。
    addOptimisticComment({
      id: `pending-${Date.now()}`,
      name,
      message,
      createdAt: new Date().toISOString(),
      pending: true,
    })

    try {
      const { comment } = await postComment({ name, message, networkMode })
      // 送出成功：把「真正的」comments 更新成包含伺服器回傳的這筆資料。
      // Action 結束的那一刻，optimisticComments 會直接收斂成這個結果，
      // 中間不會有「暫時那筆」跟「伺服器那筆」同時出現在畫面上的過程。
      setComments((prev) => [...prev, comment])
    } catch (error) {
      // 送出失敗：我們沒有更新 comments，所以 Action 結束的瞬間，剛剛樂觀
      // 顯示的那則留言會直接消失——這不是 bug，是 useOptimistic 的設計就是
      // 如此（樂觀值只在 Action 進行中存在）。用另一個 state 記錄失敗原因，
      // 讓使用者知道剛剛那則留言發生了什麼事、方便重新送出。
      setLastFailure({ name, message, reason: error.message })
    }
  }

  return (
    <section className="demo-card">
      <h2>2️⃣ useOptimistic：即時留言板</h2>
      <p className="demo-desc">
        送出留言後立刻樂觀顯示在清單最下方並標示「送出中」；等伺服器
        （Express <code>/api/comments</code>）真正回應後，才會被真實資料覆蓋——
        或者，如果送出失敗，樂觀顯示的留言會直接消失，並在下方顯示失敗原因。
        下面的「送出模式」可以明確控制要重現哪一種結果，不必依賴隨機運氣。
      </p>

      <fieldset className="network-mode">
        <legend>送出模式（模擬不同網路狀況）</legend>
        {NETWORK_MODES.map((mode) => (
          <label key={mode.value} className="network-mode-option">
            <input
              type="radio"
              name="networkMode"
              value={mode.value}
              checked={networkMode === mode.value}
              onChange={() => setNetworkMode(mode.value)}
            />
            {mode.label}
          </label>
        ))}
      </fieldset>

      {loadStatus === 'loading' && <p className="comment-status">留言載入中...</p>}
      {loadStatus === 'error' && (
        <p className="comment-status comment-status--error">
          留言載入失敗，請確認後端服務（<code>server/</code>）是否已啟動於 http://localhost:4018。
        </p>
      )}

      {loadStatus === 'ready' && (
        <ul className="comment-list">
          {optimisticComments.map((comment) => (
            <li
              key={comment.id}
              className={comment.pending ? 'comment-item comment-item--pending' : 'comment-item'}
            >
              <div className="comment-meta">
                <strong>{comment.name}</strong>
                <span>{formatTime(comment.createdAt)}</span>
                {comment.pending && <em className="comment-pending-badge">送出中...</em>}
              </div>
              <p className="comment-message">{comment.message}</p>
            </li>
          ))}
        </ul>
      )}

      {lastFailure && (
        <p className="form-banner form-banner--error" role="alert">
          ⚠️「{lastFailure.message}」送出失敗：{lastFailure.reason}（請確認內容後再試一次）
        </p>
      )}

      <form action={commentFormAction} className="comment-form">
        <input name="name" className="form-input" placeholder="你的名字（可留空）" />
        <input name="message" className="form-input" placeholder="輸入留言內容" required />
        <SubmitButton pendingLabel="送出中...">送出留言</SubmitButton>
      </form>
    </section>
  )
}

export default CommentBoard

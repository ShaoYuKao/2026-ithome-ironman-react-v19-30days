import { Suspense, useState } from 'react'
import ErrorBoundary from './ErrorBoundary.jsx'
import UserCard from './UserCard.jsx'
import UserCardSkeleton from './UserCardSkeleton.jsx'
import { getUserPromise, invalidateUser } from '../utils/api.js'

const USER_OPTIONS = [
  { id: 1, label: '1️⃣ 陳雅婷' },
  { id: 2, label: '2️⃣ 林柏宇' },
  { id: 3, label: '3️⃣ 黃詩涵' },
  { id: 4, label: '4️⃣ 王建宏' },
  { id: 5, label: '5️⃣ 李思穎' },
  { id: 99, label: '❌ 不存在的使用者（99）' },
]

/**
 * Demo 1：use(promise) + Suspense——非同步讀取使用者資料的卡片元件。
 *
 * 三個操作分別驗證今天學到的三件事：
 * 1. 切換使用者：不同 id 對應不同 Promise，會讓 Suspense 重新顯示
 *    fallback；切回「已經讀過」的使用者則會直接顯示資料，不會再看到骨架
 *    畫面——因為 getUserPromise 對同一個 id 只會建立一次 Promise（有快取）。
 * 2. 重新整理目前使用者：清除快取之後，即使 id 沒變，也會重新觸發
 *    Suspense fallback、重新發出請求（畫面上的「上次讀取時間」會更新）。
 * 3. 選擇不存在的使用者（99）：驗證 use() 讀到 rejected 的 Promise 時，
 *    會交給最近的 Error Boundary 顯示錯誤畫面，而不是讓整個 App 掛掉；
 *    切換回其他正常的使用者，錯誤畫面也會跟著清除。
 */
function UserProfileLab() {
  const [selectedId, setSelectedId] = useState(USER_OPTIONS[0].id)
  const [, forceRerender] = useState(0)

  function handleRefresh() {
    // 清掉目前這位使用者的快取，並更新一個跟畫面無關的 state 觸發重新
    // 渲染——下面 JSX 裡的 getUserPromise(selectedId) 下一次求值時，快取
    // 已經是空的，會建立「全新」的 Promise，use() 因此重新進入 pending，
    // Suspense fallback 會再次出現。
    invalidateUser(selectedId)
    forceRerender((count) => count + 1)
  }

  return (
    <section className="demo-card">
      <h2>1️⃣ use(promise) + Suspense：使用者資料卡片</h2>
      <p className="demo-desc">
        點選下方任一位使用者，畫面會透過 <code>use()</code> 讀取一個非同步的{' '}
        <code>Promise</code>；資料還沒回來之前，最近的 <code>Suspense</code>{' '}
        會先顯示骨架畫面。切換回已經讀取過的使用者不會重新顯示骨架畫面（因為
        Promise 有被快取）；選擇「不存在的使用者」則會顯示錯誤畫面，由最近的
        Error Boundary 接手處理。
      </p>

      <div className="user-picker" role="group" aria-label="選擇使用者">
        {USER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={selectedId === option.id ? 'btn btn--primary' : 'btn'}
            onClick={() => setSelectedId(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="demo-actions">
        <button type="button" className="btn" onClick={handleRefresh}>
          🔄 重新整理目前使用者
        </button>
      </div>

      {/* key={selectedId}：切換使用者時讓 Error Boundary 整個重新掛載，
          藉此清空上一位使用者可能留下的錯誤狀態——Error Boundary 不會因為
          子節點換了新內容就自動恢復，一定要明確重置（見 README 常見陷阱）。 */}
      <ErrorBoundary
        key={selectedId}
        fallback={(error, retry) => (
          <div className="error-card" role="alert">
            <p>⚠️ {error.message}</p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                invalidateUser(selectedId)
                retry()
              }}
            >
              🔁 重試
            </button>
          </div>
        )}
      >
        <Suspense fallback={<UserCardSkeleton />}>
          <UserCard userPromise={getUserPromise(selectedId)} />
        </Suspense>
      </ErrorBoundary>
    </section>
  )
}

export default UserProfileLab

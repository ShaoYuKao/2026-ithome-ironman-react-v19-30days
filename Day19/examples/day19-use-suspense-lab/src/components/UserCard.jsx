import { use } from 'react'

/**
 * 呼叫 use(userPromise) 讀取非同步資料，元件本身完全看不到任何非同步痕跡：
 * - Promise 還沒 resolve：use() 會讓這個元件「暫停」（suspend），交由外層
 *   最近的 <Suspense> 顯示 fallback，這個元件本身這一輪完全不會被渲染出來。
 * - Promise resolve 之後：use() 直接同步回傳解析後的值，寫法跟平常讀一般
 *   變數一模一樣，不需要額外宣告 isLoading / error 這類 state。
 * - Promise reject：等同於這裡丟出例外，會被最近的 Error Boundary 接住
 *   （見 ErrorBoundary.jsx），這個元件同樣完全不會被渲染出來。
 */
function UserCard({ userPromise }) {
  const user = use(userPromise)

  return (
    <article className="user-card">
      <div className="user-card__avatar" style={{ background: user.avatarColor }}>
        {user.name.slice(0, 1)}
      </div>
      <div className="user-card__body">
        <h3>{user.name}</h3>
        <p className="user-card__title">
          {user.title}・{user.city}
        </p>
        <p className="user-card__bio">{user.bio}</p>
        <p className="user-card__email">✉️ {user.email}</p>
        <p className="user-card__meta">
          上次讀取時間：{new Date(user.fetchedAt).toLocaleTimeString('zh-TW', { hour12: false })}
        </p>
      </div>
    </article>
  )
}

export default UserCard

import { useState } from 'react'

function HoverCard() {
  const [isHovering, setIsHovering] = useState(false)
  const [enterCount, setEnterCount] = useState(0)

  return (
    <section className="card">
      <h2>🖱️ onMouseEnter / onMouseLeave</h2>
      <p className="card-desc">
        <code>onMouseEnter</code>／<code>onMouseLeave</code>{' '}
        只在滑鼠「真正進入／離開這個元素本身」時觸發一次，不會像
        <code>onMouseOver</code>／<code>onMouseOut</code> 那樣，滑鼠移到子元素上也跟著冒泡觸發，
        很適合用來做 hover 卡片這種「只在意元素本身」的效果。
      </p>

      <div
        className={`hover-box${isHovering ? ' hover-box--active' : ''}`}
        onMouseEnter={() => {
          setIsHovering(true)
          setEnterCount((prev) => prev + 1)
        }}
        onMouseLeave={() => setIsHovering(false)}
      >
        <p className="hover-box__title">
          {isHovering ? '滑鼠正在上面 👋' : '把滑鼠移進來看看'}
        </p>
        <p className="hover-box__meta">已進入這個區域 {enterCount} 次</p>
      </div>
    </section>
  )
}

export default HoverCard

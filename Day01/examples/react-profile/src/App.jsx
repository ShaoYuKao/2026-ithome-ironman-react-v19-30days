import './App.css'

// Day01 練習：把純 HTML 的個人簡介頁面（static-html/index.html）
// 改寫成 React 元件。目前只是把畫面「跑起來」，
function App() {
  return (
    <div className="profile-card">
      <img
        className="avatar"
        src="https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=Felix"
        alt="使用者頭像"
      />
      <h1 className="name">陳小明</h1>
      <p className="title">前端工程師 / React 學習者</p>

      <section className="bio">
        <h2>關於我</h2>
        <p>
          我是一名熱愛前端開發的工程師，目前正在學習 React，
          希望能透過 30 天的計畫扎實打好基礎，並實際做出屬於自己的專案。
        </p>
      </section>

      <section className="skills">
        <h2>技能</h2>
        <ul>
          <li>HTML / CSS</li>
          <li>JavaScript (ES6+)</li>
          <li>React（學習中）</li>
          <li>Git / GitHub</li>
        </ul>
      </section>

      <section className="contact">
        <h2>聯絡方式</h2>
        <p>
          Email：<a href="mailto:example@mail.com">example@mail.com</a>
        </p>
        <p>
          GitHub：
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            github.com/example
          </a>
        </p>
      </section>
    </div>
  )
}

export default App

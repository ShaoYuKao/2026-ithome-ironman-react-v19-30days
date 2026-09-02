import './App.css'

// Day02 練習：延續 Day01 的個人簡介頁面，把原本寫死在 JSX 裡的文字
// 抽成一個 JavaScript 資料物件 `profile`，再透過 JSX 的 `{}` 語法
// 把資料「動態」帶入畫面，而不是把姓名、年齡、興趣清單直接寫死成字串。
const profile = {
  name: '陳小明',
  birthYear: 1998,
  jobTitle: '前端工程師 / React 學習者',
  avatarSeed: 'Felix',
  bio: '我是一名熱愛前端開發的工程師，目前正在學習 React，希望能透過 30 天的計畫扎實打好基礎，並實際做出屬於自己的專案。',
  // 興趣清單使用陣列（Array）儲存，這樣之後不管有幾項興趣，
  // 畫面渲染的程式碼都不需要修改。
  hobbies: ['閱讀', '爬山', '攝影', '寫程式'],
  skills: ['HTML / CSS', 'JavaScript (ES6+)', 'React（學習中）', 'Git / GitHub'],
  contact: {
    email: 'example@mail.com',
    github: 'https://github.com/example',
  },
}

function App() {
  // 年齡不是寫死的數字，而是用「目前年份 - 出生年份」這個 JavaScript
  // 運算式即時算出來，示範 JSX `{}` 裡面可以放任何合法的表達式（expression）。
  const age = new Date().getFullYear() - profile.birthYear

  return (
    <div className="profile-card">
      {/* JSX 註解要寫在 {} 裡面，不能直接用 HTML 的 <!-- --> */}
      <img
        className="avatar"
        src={`https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=${profile.avatarSeed}`}
        alt={`${profile.name} 的頭像`}
      />
      {/* {} 裡面除了單純變數，也可以放多個表達式用 ・ 串接 */}
      <h1 className="name">{profile.name}</h1>
      <p className="title">
        {profile.jobTitle} ・ {age} 歲
      </p>

      <section className="bio">
        <h2>關於我</h2>
        <p>{profile.bio}</p>
      </section>

      <section className="hobbies">
        <h2>興趣</h2>
        {/* 三元運算子（ternary）：依照陣列長度決定要顯示的句子 */}
        <p>
          {profile.hobbies.length > 0
            ? `共 ${profile.hobbies.length} 項興趣：${profile.hobbies.join('、')}`
            : '目前尚未填寫興趣'}
        </p>
      </section>

      <section className="skills">
        <h2>技能</h2>
        {/*
          用 .map() 把陣列轉成一串 <li> 元素，這是「在 JSX 中嵌入表達式」
          很常見的應用。每個元素需要一個獨一無二的 `key`，
          這裡先用內容本身當 key；key 背後的完整原理（React 如何用它
          比對列表差異）會在 Day 6「條件渲染 & 列表渲染」詳細說明。
        */}
        <ul>
          {profile.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </section>

      <section className="contact">
        <h2>聯絡方式</h2>
        <p>
          Email：
          <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
        </p>
        <p>
          GitHub：
          <a href={profile.contact.github} target="_blank" rel="noreferrer">
            {profile.contact.github.replace('https://', '')}
          </a>
        </p>
      </section>

      <section className="newsletter">
        <h2>訂閱電子報</h2>
        {/*
          label 用 htmlFor 對應 input 的 id（HTML 原生屬性是 `for`，
          但 `for` 是 JavaScript 保留字，JSX 因此改用 htmlFor）。
          <input /> 也示範了 JSX 要求標籤自我封閉（self-closing）的規則。
        */}
        <label htmlFor="newsletter-checkbox">
          <input type="checkbox" id="newsletter-checkbox" />
          我想收到最新文章通知
        </label>
      </section>
    </div>
  )
}

export default App

import './App.css'
import ProfileCard from './components/ProfileCard.jsx'
import SkillList from './components/SkillList.jsx'
import ContactInfo from './components/ContactInfo.jsx'

// 沿用 Day02 的資料物件，今天的重點不是「資料」，而是「畫面怎麼拆成元件」。
const profile = {
  name: '陳小明',
  birthYear: 1998,
  jobTitle: '前端工程師 / React 學習者',
  avatarSeed: 'Felix',
  bio: '我是一名熱愛前端開發的工程師，目前正在學習 React，希望能透過 30 天的計畫扎實打好基礎，並實際做出屬於自己的專案。',
  hobbies: ['閱讀', '爬山', '攝影', '寫程式'],
  skills: ['HTML / CSS', 'JavaScript (ES6+)', 'React（學習中）', 'Git / GitHub'],
  contact: {
    email: 'example@mail.com',
    github: 'https://github.com/example',
  },
}

function App() {
  const age = new Date().getFullYear() - profile.birthYear

  return (
    // App（父元件）只負責「準備資料」跟「組裝畫面」：
    // 把 profile 物件拆開，透過 props 傳給 ProfileCard；
    // 需要顯示在卡片內、但邏輯上是「另一個區塊」的內容，
    // 則直接寫成 JSX，當作 children 傳進 ProfileCard。
    <ProfileCard
      name={profile.name}
      jobTitle={profile.jobTitle}
      age={age}
      avatarSeed={profile.avatarSeed}
      bio={profile.bio}
      hobbies={profile.hobbies}
    >
      {/* 這裡的兩個元件、跟下面的 <section>，都會變成
          ProfileCard 內部 props.children 的內容（一個陣列）。
          ProfileCard 完全不需要知道 children 裡面實際放了什麼。 */}
      <SkillList skills={profile.skills} />
      <ContactInfo email={profile.contact.email} github={profile.contact.github} />
      <section className="newsletter">
        <h2>訂閱電子報</h2>
        <label htmlFor="newsletter-checkbox">
          <input type="checkbox" id="newsletter-checkbox" />
          我想收到最新文章通知
        </label>
      </section>
    </ProfileCard>
  )
}

export default App

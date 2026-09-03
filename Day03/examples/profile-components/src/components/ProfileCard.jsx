// ProfileCard：負責「卡片外框 + 頭像／姓名／簡介／興趣」這個區塊。
// 透過解構賦值（Destructuring）直接從 props 取出需要的欄位，
// 這是目前 Function Component 最常見的寫法，比起每次都寫
// `props.name`、`props.jobTitle` 簡潔許多。
function ProfileCard({ name, jobTitle, age, avatarSeed, bio, hobbies, children }) {
  return (
    <div className="profile-card">
      <img
        className="avatar"
        src={`https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=${avatarSeed}`}
        alt={`${name} 的頭像`}
      />
      <h1 className="name">{name}</h1>
      <p className="title">
        {jobTitle} ・ {age} 歲
      </p>

      <section className="bio">
        <h2>關於我</h2>
        <p>{bio}</p>
      </section>

      <section className="hobbies">
        <h2>興趣</h2>
        <p>
          {hobbies.length > 0
            ? `共 ${hobbies.length} 項興趣：${hobbies.join('、')}`
            : '目前尚未填寫興趣'}
        </p>
      </section>

      {/*
        children 是一個「特殊的 prop」，代表寫在
        <ProfileCard>...這裡的內容...</ProfileCard>
        標籤之間的所有 JSX。ProfileCard 不需要知道
        children 裡面究竟是 SkillList、ContactInfo 還是
        其他任何元件，只要負責把它「插」在對的位置即可，
        這種寫法讓 ProfileCard 變成一個可以重複使用的「容器（Container）」。
      */}
      {children}
    </div>
  )
}

export default ProfileCard

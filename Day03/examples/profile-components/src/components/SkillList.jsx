// SkillList：只負責「技能清單」這個區塊，接收 skills 陣列來渲染 <li>。
//
// `title = '技能'` 是 ES6 的「預設參數（Default Parameter）」寫法：
// 如果呼叫端沒有傳入 title 這個 prop（值為 undefined），
// 就會自動使用 '技能' 這個預設值；一旦有傳入 title，就會改用傳入的值。
// React 19 已經移除 Function Component 的 `Component.defaultProps` 寫法
// （只有 class component、以及透過 React.createElement 建立的舊元件仍相容），
// 官方目前建議的做法就是像這樣直接用 JavaScript 的預設參數。
function SkillList({ title = '技能', skills }) {
  return (
    <section className="skills">
      <h2>{title}</h2>
      <ul>
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </section>
  )
}

export default SkillList

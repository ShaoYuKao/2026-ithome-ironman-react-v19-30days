// ContactInfo：只負責「聯絡方式」這個區塊。
// 注意這裡故意示範「不解構、直接用 props 物件」的寫法，
// 跟 ProfileCard／SkillList 的解構寫法做個對照——
// 兩種寫法功能上完全相同，實務上比較推薦解構寫法（更清楚一眼看出用了哪些 props），
// 但你在別人的專案裡，兩種寫法都有機會遇到。
function ContactInfo(props) {
  const { email, github } = props

  return (
    <section className="contact">
      <h2>聯絡方式</h2>
      <p>
        Email：<a href={`mailto:${email}`}>{email}</a>
      </p>
      <p>
        GitHub：
        <a href={github} target="_blank" rel="noreferrer">
          {github.replace('https://', '')}
        </a>
      </p>
    </section>
  )
}

export default ContactInfo

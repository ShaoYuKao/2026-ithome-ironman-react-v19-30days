import { useState } from 'react'
import { CITY_OPTIONS } from '../utils/validators.js'

const SKILL_OPTIONS = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL']

// 實驗四：<select> 下拉選單的資料綁定（單選 + 多選 multiple）
//
// 單選 <select>：跟文字輸入框幾乎一樣，用 value + onChange，從 event.target.value 讀取字串。
// 多選 <select multiple>：event.target.value 只會拿到「第一個」被選到的值，
//                        必須改用 event.target.selectedOptions（一個 HTMLOptionsCollection）
//                        搭配 Array.from 轉成一般陣列，才能拿到「全部」被選到的值。
function SelectDemo() {
  const [city, setCity] = useState('')
  const [skills, setSkills] = useState([])

  function handleSkillsChange(event) {
    const selectedValues = Array.from(event.target.selectedOptions, (option) => option.value)
    setSkills(selectedValues)
  }

  return (
    <section className="card">
      <h2>4️⃣ Select 下拉選單綁定（單選 / 多選）</h2>
      <p className="card-desc">
        單選 <code>&lt;select&gt;</code> 用法跟文字輸入框一樣簡單；多選
        <code>&lt;select multiple&gt;</code> 則要改用 <code>event.target.selectedOptions</code>{' '}
        才能一次拿到所有被選取的選項。
      </p>

      <div className="form-field">
        <label className="form-label" htmlFor="city-select">
          居住城市（單選）
        </label>
        <select
          id="city-select"
          className="form-input"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        >
          <option value="">請選擇城市</option>
          {CITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="live-echo">
          目前選擇：
          <strong>{CITY_OPTIONS.find((option) => option.value === city)?.label ?? '（尚未選擇）'}</strong>
        </p>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="skills-select">
          熟悉的技能（可多選，按住 Ctrl / Cmd 點選多項）
        </label>
        <select
          id="skills-select"
          className="form-input select-multiple"
          multiple
          value={skills}
          onChange={handleSkillsChange}
        >
          {SKILL_OPTIONS.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
        <p className="live-echo">
          已選擇：<strong>{skills.length > 0 ? skills.join('、') : '（尚未選擇）'}</strong>
        </p>
      </div>
    </section>
  )
}

export default SelectDemo

import './App.css'
import ControlledVsUncontrolled from './components/ControlledVsUncontrolled.jsx'
import CheckboxDemo from './components/CheckboxDemo.jsx'
import RadioGroupDemo from './components/RadioGroupDemo.jsx'
import SelectDemo from './components/SelectDemo.jsx'
import RegisterForm from './components/RegisterForm.jsx'

function App() {
  return (
    <div className="form-lab-page">
      <header className="page-header">
        <p className="eyebrow">Day 09 表單處理進階</p>
        <h1>表單處理實驗室</h1>
        <p className="subtitle">
          五個小型範例，依序練習受控元件（Controlled Component）與非受控元件（Uncontrolled
          Component）的差異、<code>&lt;input type=&quot;checkbox&quot;&gt;</code>、
          <code>&lt;input type=&quot;radio&quot;&gt;</code>、<code>&lt;select&gt;</code>
          （含多選 <code>multiple</code>）的資料綁定寫法，最後整合成一個具備多欄位狀態管理與表單驗證的會員註冊表單。
        </p>
      </header>

      <main className="card-grid">
        <ControlledVsUncontrolled />
        <CheckboxDemo />
        <RadioGroupDemo />
        <SelectDemo />
        <RegisterForm />
      </main>
    </div>
  )
}

export default App

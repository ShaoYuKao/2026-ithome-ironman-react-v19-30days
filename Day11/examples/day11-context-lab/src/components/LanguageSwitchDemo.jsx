import { LanguageProvider, useLanguage } from '../contexts/LanguageContext.jsx'

// 證明 Context 這套解法不是「theme 專用」：只要是「很多元件都要共用、
// 又不想一層層手動傳」的資料，都可以用同樣的 createContext + Provider + useContext 模式解決。
// 這裡刻意用一個跟 theme 完全無關的「語言切換」當作第二個範例。

function Greeting() {
  const { t } = useLanguage()
  return <p className="form-hint">{t('greeting')}</p>
}

function FooterNote() {
  const { t } = useLanguage()
  return <p className="form-hint">{t('footer')}</p>
}

function LanguageSwitcherButton() {
  const { t, toggleLanguage } = useLanguage()
  return (
    <button type="button" className="secondary-btn" onClick={toggleLanguage}>
      {t('toggleLabel')}
    </button>
  )
}

function LanguageSwitchDemo() {
  return (
    <section className="card">
      <h2>3️⃣ 多個獨立 Context 並存：語言切換</h2>
      <p className="card-desc">
        <code>ThemeContext</code> 管理主題、<code>LanguageContext</code>{' '}
        管理語言，兩者是完全獨立、互不干擾的 Context：元件要用哪一種資料，就
        import 對應的 <code>useTheme()</code> 或 <code>useLanguage()</code>
        。一個專案裡同時存在多個 Context 是很常見的作法，不需要硬把所有資料塞進同一個
        Context 裡。
      </p>
      <LanguageProvider>
        <div className="props-drilling-tree props-drilling-tree--light">
          <Greeting />
          <LanguageSwitcherButton />
          <FooterNote />
        </div>
      </LanguageProvider>
    </section>
  )
}

export default LanguageSwitchDemo

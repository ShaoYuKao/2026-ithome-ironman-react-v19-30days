import { createContext, useContext, useState } from 'react'

// 第二個「獨立」的 Context：語言切換（zh / en）。
// 這個檔案刻意跟 ThemeContext.jsx 結構幾乎一模一樣，
// 用意是證明「createContext + Provider + useContext」是一套可以重複套用的通用解法，
// 不是只能拿來做深色模式——任何「很多層元件都要共用、又不想手動一層層傳」的資料都適用。
const translations = {
  zh: {
    greeting: '你好！這段文字是透過 LanguageContext 從最上層傳下來的。',
    footer: '這個頁尾文字，同樣是靠 useLanguage() 直接取得，沒有經過任何 props 轉傳。',
    toggleLabel: '切換成 English',
  },
  en: {
    greeting: 'Hello! This text is provided top-down via LanguageContext.',
    footer: 'This footer text also comes directly from useLanguage(), with zero props drilling.',
    toggleLabel: '切換成中文',
  },
}

const LanguageContext = createContext(null)

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('zh')

  function toggleLanguage() {
    setLanguage((prev) => (prev === 'zh' ? 'en' : 'zh'))
  }

  // t()：依照目前語言查表回傳對應文字，元件只需要呼叫 t('greeting') 這種 key，
  // 不需要知道目前語言到底是什麼，也不需要自己判斷 if/else。
  function t(key) {
    return translations[language][key]
  }

  // 跟 ThemeContext.jsx 一樣，這裡先用最直覺的物件字面值寫法即可；
  // 用 useMemo 快取 value 屬於效能優化，Day15 才會學到，現階段不需要煩惱。
  const value = { language, toggleLanguage, t }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === null) {
    throw new Error('useLanguage 必須在 <LanguageProvider> 內使用')
  }
  return context
}

export { LanguageProvider, useLanguage } // eslint-disable-line react/only-export-components -- Provider 與其搭配的自訂 Hook 刻意放在同一檔案，方便對照學習

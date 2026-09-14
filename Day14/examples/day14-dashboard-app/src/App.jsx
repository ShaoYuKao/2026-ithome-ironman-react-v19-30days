import './App.css'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { TabProvider } from './contexts/TabContext.jsx'
import DashboardApp from './components/DashboardApp.jsx'

// App：今天只負責一件事——把兩個 Context Provider 包在最外層。
//
// ThemeProvider 在外、TabProvider 在內（順序其實不影響功能，因為兩者互不依賴），
// 兩個 Provider 包起來的範圍涵蓋整個 DashboardApp，
// 代表 DashboardApp 底下任何深度的子元件，都能直接呼叫 useTheme() / useTab()，
// 不需要再靠 props 一層層往下傳。
function App() {
  return (
    <ThemeProvider>
      <TabProvider>
        <DashboardApp />
      </TabProvider>
    </ThemeProvider>
  )
}

export default App

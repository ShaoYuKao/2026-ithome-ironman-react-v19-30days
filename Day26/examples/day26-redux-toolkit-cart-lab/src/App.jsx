import './App.css'
import ProductList from './components/ProductList.jsx'
import CartPanel from './components/CartPanel.jsx'

// App：左側商品列表、右側購物車面板，兩者都直接透過 react-redux 的
// useSelector／useDispatch 存取同一個 store，中間不需要任何 props 傳遞。
function App() {
  return (
    <div className="shop-page">
      <header className="page-header">
        <p className="eyebrow">Day 26 Redux Toolkit 實戰（一）</p>
        <h1>Redux Toolkit 購物車 Lab</h1>
        <p className="subtitle">
          把 Day25 設計的購物車 state／action／reducer／selector 規格，
          用 <code>configureStore</code>、<code>createSlice</code>、<code>useSelector</code>、
          <code>useDispatch</code> 實作出來：加入商品、移除商品、修改數量、計算總金額。
        </p>
      </header>

      <main className="shop-layout">
        <ProductList />
        <CartPanel />
      </main>
    </div>
  )
}

export default App

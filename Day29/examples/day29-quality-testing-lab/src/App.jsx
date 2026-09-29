import { PRODUCTS } from './data/products.js'
import ProductCard from './components/ProductCard.jsx'
import CartSummary from './components/CartSummary.jsx'
import './App.css'

// App：這個範例的畫面故意做得很單純（一個標題 + 購物車小計 + 商品清單），
// 因為今天的重點是「怎麼幫元件寫測試」，不是新的畫面或路由設計。
// 商品清單、加入購物車、調整數量等操作，都可以直接在畫面上手動試用；
// 而 QuantityStepper／AddToCartButton／ProductCard 這三個核心元件，
// 各自都有對應的 *.test.jsx，可以用 `npm run test` 執行。
function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Day 29｜程式碼品質與測試 Lab</h1>
          <p className="app__lead">選好數量後按下「加入購物車」，右上角的小計會即時更新。</p>
        </div>
        <CartSummary />
      </header>

      <ul className="product-list">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </div>
  )
}

export default App

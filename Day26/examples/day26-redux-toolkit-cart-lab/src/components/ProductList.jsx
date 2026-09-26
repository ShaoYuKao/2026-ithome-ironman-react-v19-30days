import { useDispatch } from 'react-redux'
import { PRODUCTS } from '../data/products.js'
import { addItem } from '../store/cartSlice.js'

// ProductList：商品清單，每張卡片的「加入購物車」按鈕都 dispatch 同一個
// cart/addItem action，帶上商品完整資訊當 payload。
// 「已經在購物車裡就 qty+1、否則新增一筆」的判斷邏輯完全交給 cartSlice 的
// reducer 決定，不管使用者從哪張卡片按下加入，呼叫的都是同一份邏輯——
// 對應 Day25 第一節「集中管理商業邏輯」的動機。
function ProductList() {
  const dispatch = useDispatch()

  return (
    <section className="card">
      <h2>商品列表</h2>
      <p className="card-desc">
        點擊「加入購物車」會 dispatch <code>cart/addItem</code>；右側購物車面板
        透過 <code>useSelector</code> 訂閱 <code>state.cart</code>，會立即顯示最新結果。
      </p>
      <div className="product-grid">
        {PRODUCTS.map((product) => (
          <article key={product.id} className="product-card">
            <div className="product-card__image" aria-hidden="true">
              {product.image}
            </div>
            <p className="product-card__name">{product.name}</p>
            <p className="product-card__price">NT$ {product.price.toLocaleString()}</p>
            <button type="button" className="primary-btn" onClick={() => dispatch(addItem(product))}>
              加入購物車
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProductList

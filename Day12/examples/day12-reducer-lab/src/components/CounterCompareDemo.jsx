import { useReducer, useState } from 'react'
import { counterReducer, initialCounterState } from '../reducers/counterReducer.js'

// StateCounter：完全用 Day04 學過的 useState 實作，四個操作各自呼叫一次 setCount。
// 動作本身很單純時（只有加一、減一），useState 完全夠用，沒有必要為了「以後可能變複雜」
// 就提早引入 useReducer——這點呼應 Day11 提過的「不要為了怕以後變複雜而過早使用」原則。
function StateCounter() {
  const [count, setCount] = useState(0)

  return (
    <div className="counter-box">
      <p className="counter-value">{count}</p>
      <div className="button-row">
        <button type="button" className="secondary-btn" onClick={() => setCount((prev) => prev - 1)}>
          -1
        </button>
        <button type="button" className="secondary-btn" onClick={() => setCount((prev) => prev + 1)}>
          +1
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setCount((prev) => prev + 5)}
        >
          +5
        </button>
        <button type="button" className="secondary-btn" onClick={() => setCount(0)}>
          重設
        </button>
      </div>
      <p className="form-hint">
        四個按鈕，各自呼叫一次 <code>setCount(...)</code>，更新邏輯分散寫在四個地方。
      </p>
    </div>
  )
}

// ReducerCounter：改用 useReducer，把「count 可能發生的所有變化」
// 集中寫在 counterReducer 這一個純函式裡（見 src/reducers/counterReducer.js）。
// 元件本身只負責兩件事：① 呼叫 useReducer 取得 state 與 dispatch，
// ② 在事件處理器裡 dispatch 一個「描述發生了什麼事」的 action 物件，
// 完全不需要知道 count 實際上是怎麼被計算出來的。
function ReducerCounter() {
  const [state, dispatch] = useReducer(counterReducer, initialCounterState)

  return (
    <div className="counter-box">
      <p className="counter-value">{state.count}</p>
      <div className="button-row">
        <button type="button" className="secondary-btn" onClick={() => dispatch({ type: 'counter/decrement' })}>
          -1
        </button>
        <button type="button" className="secondary-btn" onClick={() => dispatch({ type: 'counter/increment' })}>
          +1
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => dispatch({ type: 'counter/incrementByAmount', payload: { amount: 5 } })}
        >
          +5
        </button>
        <button type="button" className="secondary-btn" onClick={() => dispatch({ type: 'counter/reset' })}>
          重設
        </button>
      </div>
      <p className="form-hint">
        四個按鈕都呼叫同一個 <code>dispatch</code>，差別只在丟出去的 action 物件不同；
        實際的計算邏輯全部集中在 <code>counterReducer</code> 裡。
      </p>
    </div>
  )
}

function CounterCompareDemo() {
  return (
    <section className="card">
      <h2>1️⃣ useState vs useReducer：從一個計數器開始比較</h2>
      <p className="card-desc">
        左邊是 Day04 學過的 <code>useState</code> 寫法，右邊是今天的 <code>useReducer</code>
        寫法——兩邊做的事情一模一樣（+1、-1、+5、重設），畫面操作起來也完全沒有差異。
        重點在於「程式碼組織方式」的差異：<code>useState</code> 版本的四個操作，各自寫在
        四個按鈕的 <code>onClick</code> 裡；<code>useReducer</code> 版本則是把「count
        可能發生的所有變化」都集中寫在同一個 <code>counterReducer</code> 函式裡，元件本身只負責
        <code>dispatch</code> 一個 action。目前這個計數器邏輯還很單純，兩種寫法都合理；
        當「操作種類變多、且彼此會互相影響」時（見下面第 2、3 個範例），
        <code>useReducer</code> 的優勢才會真正浮現。
      </p>
      <div className="counter-compare-grid">
        <div>
          <p className="form-label">useState 版本</p>
          <StateCounter />
        </div>
        <div>
          <p className="form-label">useReducer 版本</p>
          <ReducerCounter />
        </div>
      </div>
    </section>
  )
}

export default CounterCompareDemo

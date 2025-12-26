import './styles.scss'

import './index.scss'
import './index.css'

import { createRoot } from 'react-dom/client'
import { App } from './App'
// import { TestApp } from './Test'

createRoot(document.getElementById('root')!).render(<App />)

const error = console.error
console.error = (...args: any) => {
  if (/defaultProps/.test(args[0])) return
  if (/findDOMNode/.test(args[0])) return

  error(...args)
}

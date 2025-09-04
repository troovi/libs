import './index.scss'
import './index.css'
import '../src/theme.scss'

import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(<App />)

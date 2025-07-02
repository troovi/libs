import './index.scss'
import { Transition } from '@headlessui/react'
import { useState } from 'react'

export const Test2Animation = () => {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: '40px', display: 'flex', gap: '20px' }}>
      <div style={{ padding: '10px', width: '200px' }}>
        <button onClick={() => setOpen((open) => !open)}>Animation 2(*1)</button>
        <Transition show={open}>
          <div className="test-2-animation box-styles">Target element</div>
        </Transition>
      </div>
    </div>
  )
}

export const Test2CompletedAnimation = () => {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: '40px', display: 'flex', gap: '20px' }}>
      <div style={{ padding: '10px', width: '200px' }}>
        <button onClick={() => setOpen((open) => !open)}>Animation 2(*2)</button>
        <Transition show={open}>
          <div className="test-2-completed-animation box-styles">Target element</div>
        </Transition>
      </div>
    </div>
  )
}

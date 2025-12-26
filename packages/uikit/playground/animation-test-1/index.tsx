import './index.scss'
// import { useState } from 'react'

export const Test1Animation = () => {
  // const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: '40px', display: 'flex', gap: '20px' }}>
      <div style={{ padding: '10px', width: '200px' }}>
        {/* <button onClick={() => setOpen((open) => !open)}>Animation 1</button> */}
        {/* <Transition show={open}> */}
        <div className="test-1-animation box-styles">Target element</div>
        {/* </Transition> */}
      </div>
    </div>
  )
}

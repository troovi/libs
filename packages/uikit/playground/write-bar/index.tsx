import { WriteBar } from '@/WriteBar'
import { faPaperPlaneTop, faPaperclip } from '@companix/icons-solid'
import { useState } from 'react'

export const WriteBarExample = () => {
  const [value, setValue] = useState('')

  return (
    <div className="col-group">
      <WriteBar
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Введите сообщение..."
        id="write-bar-textarea-id"
        before={<WriteBar.IconButton icon={faPaperclip} mode="attach" />}
        after={
          <WriteBar.IconButton
            icon={faPaperPlaneTop}
            onClick={() => setValue('')}
            mode="send"
            isHidden={value === ''}
          />
        }
      />
    </div>
  )
}

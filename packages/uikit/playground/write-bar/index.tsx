import { WriteBar } from '@/WriteBar'
import { Editor } from '@/index'
import { faPaperPlaneTop, faPaperclip } from '@companix/icons-solid'
import { useCallback, useEffect, useRef, useState } from 'react'

export const WriteBarExample = () => {
  const editorRef = useRef<Editor | null>(null)
  const onCreate = useCallback((editor: Editor) => {
    editorRef.current = editor
  }, [])

  const [state, setState] = useState({
    value: '',
    selection: { from: 0, to: 0 }
  })

  useEffect(() => {
    return editorRef.current?.onContentChange((text, selection) => {
      setState(() => ({ value: text, selection }))
    })
  }, [])

  console.log(state)

  return (
    <div className="col-group">
      <WriteBar
        onCreate={onCreate}
        placeholder="Введите сообщение..."
        id="write-bar-textarea-id"
        before={<WriteBar.IconButton icon={faPaperclip} mode="attach" />}
        after={
          <WriteBar.IconButton
            icon={faPaperPlaneTop}
            onClick={() => editorRef.current?.resetText()}
            isHidden={state.value === ''}
            mode="send"
          />
        }
      />
    </div>
  )
}

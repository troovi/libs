import { Blank } from '@/Blank'
import { DropArea, DropAreaProvider, useDragEnter } from '@/DropArea'
import { Icon } from '@/Icon'
import { faCloudArrowUp, faFile } from '@companix/icons-solid'

export const DropAreaExample = () => {
  return (
    <div className="row-group" style={{ gap: '16px' }}>
      <ContentArea />
    </div>
  )
}

const ContentArea = () => {
  return (
    <DropAreaProvider>
      <Container>
        <Content />
        <DropArea
          onFilesAdd={console.log}
          title="Upload file"
          text="Drag and drop here"
          icon={<Icon icon={faCloudArrowUp} />}
        />
      </Container>
    </DropAreaProvider>
  )
}

const Container = ({ children }: { children: React.ReactNode }) => {
  const onDragEnter = useDragEnter()

  console.log('container drag-and-drop render')

  return (
    <div
      className="w-full blank-example rounded-lg relative"
      style={{ height: '340px' }}
      onDragEnter={onDragEnter}
    >
      {children}
    </div>
  )
}

const Content = () => {
  console.log('content drag-and-drop render')

  return <Blank icon={faFile} title="Bring the file" />
}

import { Button } from '@/Button'
import { ButtonGroup } from '@/ButtonGroup'
import { Icon } from '@/Icon'
import { ProgressBar } from '@/Progress'
import { ToastOptions, createToaster } from '@/Toaster'
import { Toast } from '@/index'
import {
  faCircleCheck,
  faCircleInfo,
  faCloudArrowUp,
  faTriangleExclamation
} from '@companix/icons-solid'
import { useState } from 'react'

const { api: toaster, Viewport: ToasterViewport } = createToaster({
  duration: 2500,
  align: 'center'
})

export const ToasterExample = () => {
  const [side, setSide] = useState<'top' | 'bottom'>('top')
  const [align, setAlign] = useState<'center' | 'left' | 'right'>('center')

  const handleCreateEvent = () => {
    toaster.show({
      appearance: 'neutral',
      title: 'Event created',
      description: 'Sunday, December 21, 2025 at 2:45 AM'
    })
  }

  const handleCopyText = () => {
    toaster.show({
      appearance: 'neutral',
      title: 'The text is copied'
    })
  }

  const handleMoveFiles = () => {
    toaster.show({
      appearance: 'positive',
      title: 'Move files is completed!',
      description: 'Moved 6 files'
    })
  }

  const handleDelete = () => {
    toaster.show({
      appearance: 'negative',
      title: 'Permission error',
      description:
        'You do not have permissions to perform this action. Please contact your system administrator to request the appropriate access rights.'
    })
  }

  const renderProgress = (progress: number): ToastOptions => {
    return {
      closable: false,
      duration: progress < 100 ? Infinity : 1000,
      description: (
        <div className="flex items-center gap-10">
          <Icon icon={faCloudArrowUp} size="xxs" className="quieter" />
          <ProgressBar appearance={progress < 100 ? 'primary' : 'positive'} value={progress / 100} />
          <Toast.Close className="toaster-progress-close" />
        </div>
      )
    }
  }

  const handleUpload = () => {
    let progress = 0

    const id = toaster.show(renderProgress(progress))
    const progressToastInterval = setInterval(() => {
      if (progress > 100) {
        clearInterval(progressToastInterval)
      } else {
        progress += 10 + Math.random() * 20
        toaster.show({ id, ...renderProgress(progress) })
      }
    }, 1000)
  }

  return (
    <div>
      <div className="col-group">
        <div className="row-group">
          <ButtonGroup>
            <Button active={side === 'top'} onClick={() => setSide('top')}>
              top
            </Button>
            <Button active={side === 'bottom'} onClick={() => setSide('bottom')}>
              bottom
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button active={align === 'left'} onClick={() => setAlign('left')}>
              left
            </Button>
            <Button active={align === 'center'} onClick={() => setAlign('center')}>
              center
            </Button>
            <Button active={align === 'right'} onClick={() => setAlign('right')}>
              right
            </Button>
          </ButtonGroup>
        </div>
        <div className="row-group">
          <Button appearance="neutral" onClick={handleCreateEvent}>
            Create event
          </Button>
          <Button onClick={handleCopyText}>Copy text</Button>
          <Button onClick={handleMoveFiles}>Move files</Button>
          <Button onClick={handleDelete}>Delete root</Button>
          <Button onClick={handleUpload}>Upload file</Button>
        </div>
        <div className="row-group">
          <Button
            appearance="primary"
            onClick={() => {
              toaster.show({
                appearance: 'primary',
                title: 'Event has been created',
                description: 'Be at the area 10 minutes before the event time',
                icon: <Icon icon={faCircleInfo} />
              })
            }}
          >
            Primary
          </Button>
          <Button
            appearance="neutral"
            onClick={() => {
              toaster.show({
                appearance: 'neutral',
                title: 'Event has been created',
                description: 'Be at the area 10 minutes before the event time',
                icon: <Icon icon={faCircleInfo} />
              })
            }}
          >
            Neutral
          </Button>
          <Button
            appearance="positive"
            onClick={() => {
              toaster.show({
                appearance: 'positive',
                title: 'Event has been created',
                description: 'Be at the area 10 minutes before the event time',
                icon: <Icon icon={faCircleCheck} />
              })
            }}
          >
            Positive
          </Button>
          <Button
            appearance="negative"
            onClick={() => {
              toaster.show({
                appearance: 'negative',
                title: 'Event has been created',
                description: 'Be at the area 10 minutes before the event time',
                icon: <Icon icon={faTriangleExclamation} />
              })
            }}
          >
            Negative
          </Button>
          <Button
            appearance="neutral"
            onClick={() => {
              toaster.show({
                appearance: 'warning',
                title: 'Event has been created',
                description: 'Be at the area 10 minutes before the event time',
                icon: <Icon icon={faTriangleExclamation} />
              })
            }}
          >
            Warning
          </Button>
        </div>
      </div>
      <ToasterViewport align={align} side={side} />
    </div>
  )
}

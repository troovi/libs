import { Button } from '@/Button'
import { ButtonGroup } from '@/ButtonGroup'
import { Icon } from '@/Icon'
import { createToaster } from '@/Toaster'
import { faCircleCheck, faCircleInfo, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

const Toaster = createToaster({ duration: 2500, align: 'center' })

export const ToasterExample = () => {
  const [side, setSide] = useState<'top' | 'bottom'>('top')
  const [align, setAlign] = useState<'center' | 'left' | 'right'>('center')

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
          <Button
            appearance="neutral"
            onClick={() => {
              Toaster.send({
                appearance: 'neutral',
                title: 'Event created',
                description: 'Sunday, December 21, 2025 at 2:45 AM'
              })
            }}
          >
            Create event
          </Button>
          <Button
            onClick={() => {
              Toaster.send({
                appearance: 'neutral',
                title: 'The text is copied'
              })
            }}
          >
            Copy text
          </Button>
          <Button
            onClick={() => {
              Toaster.send({
                appearance: 'positive',
                title: 'Move files is completed!',
                description: 'Moved 6 files'
              })
            }}
          >
            Move files
          </Button>
          <Button
            onClick={() =>
              Toaster.send({
                appearance: 'negative',
                title: 'Permission error',
                description:
                  'You do not have permissions to perform this action. Please contact your system administrator to request the appropriate access rights.'
              })
            }
          >
            Delete root
          </Button>
        </div>
        <div className="row-group">
          <Button
            appearance="primary"
            onClick={() => {
              Toaster.send({
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
              Toaster.send({
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
              Toaster.send({
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
              Toaster.send({
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
              Toaster.send({
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
      <Toaster.Viewport align={align} side={side} />
    </div>
  )
}

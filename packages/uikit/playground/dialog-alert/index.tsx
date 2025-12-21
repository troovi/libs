import { Button } from '@/Button'
import { createAlertAgent } from '@/DialogAlert'
import { Icon } from '@/Icon'
import { faWifi } from '@fortawesome/free-solid-svg-icons'

const AlertAgent = createAlertAgent({ cancelDefaultText: 'Cancel' })

export const DialogAlertExample = () => {
  return (
    <div className="row-group">
      <Button
        onClick={() => {
          AlertAgent.show({
            title: 'Are you sure?',
            confirm: { text: 'Move to trash' },
            description: `Are you sure you want to move filename to Trash? You will be able to restore it later, but it will become private to you`
          })
        }}
      >
        Move to trash
      </Button>
      <Button
        onClick={() => {
          AlertAgent.show({
            cancel: { text: 'Okay' },
            description: `Couldn't create the file because the containing folder doesn't exist anymore. You will be redirected to your user folder`
          })
        }}
      >
        Do unable
      </Button>
      <Button
        onClick={() => {
          AlertAgent.show({
            disableCancel: true,
            icon: <Icon icon={faWifi} />,
            confirm: { text: 'Reload', appearance: 'neutral', onClick: () => window.location.reload() },
            description: `Connection is interupted. Page will be reloaded`
          })
        }}
      >
        Reconnecting
      </Button>
      <AlertAgent.Viewport />
    </div>
  )
}

import { Button } from '@/Button'
import { Popups } from './registry'

export const DialogRegistries = () => {
  return (
    <>
      <Popups.Overlay />
      <div className="row-group">
        <Button onClick={() => Popups.Open.Dialog1({ name: 'Pavel', surname: 'Victorov' })}>
          Dialog 1
        </Button>
        <Button onClick={() => Popups.Open.Dialog2({ age: 20, birthday: new Date() })}>Dialog 2</Button>
      </div>
    </>
  )
}

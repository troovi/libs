import { Button } from '@/Button'
import { PopupsRegistry } from './registry'

export const DialogRegistries = () => {
  return (
    <>
      <div className="row-group">
        <Button onClick={() => PopupsRegistry.Open.Dialog1({ name: 'Pavel', surname: 'Victorov' })}>
          Dialog 1
        </Button>
        <Button onClick={() => PopupsRegistry.Open.Dialog2({ age: 20, birthday: new Date() })}>
          Dialog 2
        </Button>
      </div>
    </>
  )
}

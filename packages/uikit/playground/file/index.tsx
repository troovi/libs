import { Button } from '@/Button'
import { FileOverlay } from '@/File'
import { Icon } from '@/Icon'
import { faFile, faImage, faVideo } from '@fortawesome/free-solid-svg-icons'

export const FileExample = () => {
  return (
    <div className="col-group">
      <div className="flex gap-18">
        <FileOverlay>
          <Button Component="a" icon={<Icon icon={faFile} size="xxs" />}>
            Upload any file
          </Button>
        </FileOverlay>
        <FileOverlay mimes={['image']}>
          <Button Component="a" icon={<Icon icon={faImage} size="xxs" />}>
            Upload image
          </Button>
        </FileOverlay>
        <FileOverlay mimes={['video']}>
          <Button Component="a" icon={<Icon icon={faVideo} size="xxs" />}>
            Upload video
          </Button>
        </FileOverlay>
      </div>
    </div>
  )
}

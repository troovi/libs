import { Appearance, Button, Mode, Size } from '@/Button'
import {
  faPlay,
  faPause,
  faBookmark,
  faArrowRight,
  faChevronRight,
  faFolderBlank,
  faEye,
  faCaretDown,
  faPen,
  faFile
} from '@fortawesome/free-solid-svg-icons'
import { Icon } from '@/Icon'
import { ButtonGroup } from '@/ButtonGroup'

const appearances: Appearance[] = ['primary', 'neutral', 'positive', 'negative']
const modes: Mode[] = ['default', 'outline', 'minimal']
const sizes: Size[] = ['sm', 'md', 'lg']

export const ButtonsExample = () => {
  return (
    <div className="col-group">
      {appearances.map((appearance) => {
        return (
          <div className="row-group" key={`appearance-${appearance}`}>
            {modes.map((mode) => (
              <Button key={`mode-1-${appearance}-${mode}`} appearance={appearance} mode={mode}>
                Button
              </Button>
            ))}
            {[...modes].reverse().map((mode) => (
              <Button key={`mode-2-${appearance}-${mode}`} appearance={appearance} mode={mode} disabled>
                Button
              </Button>
            ))}
          </div>
        )
      })}
      <div className="row-group">
        {sizes.map((size) => (
          <Button key={`size-${size}`} icon={<Icon icon={faBookmark} size="xxxs" />} size={size}>
            Button
          </Button>
        ))}
      </div>
      <div className="row-group">
        <Button icon={<Icon icon={faPause} size="xxxs" />} size="md"></Button>
        <Button icon={<Icon icon={faPlay} size="xxxs" />} size="md">
          Button
        </Button>
        <Button iconRight={<Icon icon={faArrowRight} size="xxxs" />}>Button</Button>
        <Button fill iconRight={<Icon icon={faChevronRight} size="xxxs" className="quieter" />}>
          Button
        </Button>
        <Button
          fill
          icon={<Icon icon={faFolderBlank} size="xxxs" />}
          iconRight={<Icon icon={faChevronRight} size="xxxs" className="quieter" />}
        >
          Button
        </Button>
      </div>
      <div className="row-group">
        <Button fill align="left">
          Left
        </Button>
        <Button fill align="center">
          Center
        </Button>
        <Button fill align="right">
          Right
        </Button>
      </div>
      <div className="row-group">
        <Button loading>Button fullwidth</Button>
        <Button disabled>Button disabled</Button>
        <Button fill>Button fullwidth</Button>
      </div>
    </div>
  )
}

export const ButtonsGroupExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <ButtonGroup>
          <Button>Button One</Button>
          <Button>Button Two</Button>
          <Button>Button Three</Button>
        </ButtonGroup>
      </div>
      <div className="row-group">
        <ButtonGroup fill>
          <Button>Secondary</Button>
          <Button fill>Primary</Button>
        </ButtonGroup>
      </div>
      <div className="row-group">
        <ButtonGroup>
          <Button icon={<Icon icon={faBookmark} size="xxxs" />} />
          <Button>Button name</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button>Button name</Button>
          <Button icon={<Icon icon={faBookmark} size="xxxs" />} />
        </ButtonGroup>
        <ButtonGroup>
          <Button
            icon={<Icon icon={faFile} size="xxxs" />}
            iconRight={<Icon icon={faCaretDown} size="xxxs" className="quieter" />}
          >
            File
          </Button>
          <Button
            icon={<Icon icon={faPen} size="xxxs" />}
            iconRight={<Icon icon={faCaretDown} size="xxxs" className="quieter" />}
          >
            Edit
          </Button>
          <Button
            icon={<Icon icon={faEye} size="xxxs" />}
            iconRight={<Icon icon={faCaretDown} size="xxxs" className="quieter" />}
          >
            View
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}

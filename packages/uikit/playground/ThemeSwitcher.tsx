import { Button } from '@/Button'
import { ButtonGroup } from '@/ButtonGroup'
import { Icon } from '@/Icon'
import { useTheme } from '@/ThemeProvider'
import { faCircleHalfStroke, faMoon, faSunBright } from '@companix/icons-solid'

export const ThemeSwitcher = () => {
  const { colorScheme, setColorScheme } = useTheme()

  console.log({ colorScheme })

  return (
    <div className="flex items-center">
      <ButtonGroup>
        <Button
          icon={<Icon icon={faSunBright} size="xxs" />}
          onClick={() => setColorScheme('light')}
          active={colorScheme === 'light'}
        >
          Light
        </Button>
        <Button
          icon={<Icon icon={faCircleHalfStroke} size="xxs" />}
          onClick={() => setColorScheme('system')}
          active={colorScheme === 'system'}
        >
          System
        </Button>
        <Button
          icon={<Icon icon={faMoon} size="xxs" />}
          onClick={() => setColorScheme('dark')}
          active={colorScheme === 'dark'}
        >
          Dark
        </Button>
      </ButtonGroup>
    </div>
  )
}

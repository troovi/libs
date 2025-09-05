import cn from 'classnames'

import { ChevronDown, ChevronUp } from '@blueprintjs/icons'
import './Select.scss'
import * as Headless from '@headlessui/react'
import { useMemo, forwardRef } from 'react'
import { attr } from '@troovi/utils-browser'
import { hasMouse } from '../__utils/device'
import { ClickTrap } from './ClickTrap'
import { OptionsList } from '../OptionItem/OptionsList'
import { OptionItem } from '../OptionItem/OptionItem'
import { useButtonWidth, usePopoverLeftValue } from '../__hooks/use-popover-position'

export interface Option<T> {
  title: string
  value: T
  icon?: JSX.Element
  label?: string
}

interface SelectProps<T> {
  options: Option<T>[]
  onChange: (event: T) => void
  value: T | null
  placeholder?: string
  className?: string
  fill?: boolean
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  disabled?: boolean
}

export const Select = <T,>({
  options,
  className,
  onChange,
  value,
  disabled,
  fill,
  error,
  size,
  icon,
  placeholder
}: SelectProps<T>) => {
  const { buttonRef, getWidthValue } = useButtonWidth()
  const { popoverRef, getLeftValue } = usePopoverLeftValue()

  const currentOption = useMemo(() => {
    return options.find((o) => o.value === value)
  }, [options, value])

  return (
    <Headless.Listbox value={currentOption?.value ?? null} onChange={onChange}>
      {({ open }) => (
        <>
          <Headless.ListboxButton
            ref={buttonRef}
            className={cn('select', className)}
            data-size={size ?? 'md'}
            data-fill={attr(fill)}
            data-error={attr(error)}
            data-disabled={attr(disabled)}
            as={hasMouse ? ClickTrap : undefined}
          >
            {icon}
            <div className="select-label" data-placeholder={attr(currentOption === undefined)}>
              {currentOption ? currentOption.title : placeholder ?? 'Не выбрано'}
            </div>
            <div className="select-arrow">{open ? <ChevronUp /> : <ChevronDown />}</div>
          </Headless.ListboxButton>
          <Headless.ListboxOptions
            ref={popoverRef}
            anchor="bottom"
            className="select-popup"
            transition
            style={{
              ['--button-w' as string]: getWidthValue(),
              ['--prev-left' as string]: getLeftValue()
            }}
          >
            <OptionsList maxHeight={300}>
              {options.map(({ value, title, icon }, i) => (
                <Headless.ListboxOption
                  key={`select-option-${value}-${i}`}
                  value={value}
                  title={title}
                  // @ts-ignore
                  icon={icon}
                  as={Item}
                />
              ))}
            </OptionsList>
          </Headless.ListboxOptions>
        </>
      )}
    </Headless.Listbox>
  )
}

const Item = forwardRef<HTMLDivElement, { title: string }>((props, ref) => {
  return <OptionItem ref={ref} {...props} />
})

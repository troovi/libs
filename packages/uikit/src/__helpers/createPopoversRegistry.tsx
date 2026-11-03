import { Popover, PopoverProps } from '../Popover'

export type PopoverContentProps<T> = {
  data: T
  close: () => void
}

type PopoverSignature = (options: PopoverContentProps<any>) => JSX.Element
type Store = { [name: string]: PopoverSignature }

// prettier-ignore
type UnwrapProps<T extends PopoverSignature> = Parameters<T>[0] extends PopoverContentProps<infer Q> ? Q : never

// prettier-ignore
type PopoversStore<T extends Store> = {
  [P in keyof T]: (props: Omit<PopoverProps, 'content'> & (UnwrapProps<T[P]> extends never ? { data?: unknown } : { data: UnwrapProps<T[P]> })) => JSX.Element
}

/**
 * Реестр поповеров: поповер — компонент с `{ data, close }`, место вызова оборачивает им триггер. Содержимое рисуется
 * элементом, а не вызовом функции: Radix монтирует его только у открытого поповера, поэтому хуки поповера живут от
 * открытия до закрытия — состояние начинается заново при каждом открытии, а очистка эффектов срабатывает при закрытии.
 */
export const createPopoversRegistry = <T extends Store>(mapping: T) => {
  const Popovers = {} as PopoversStore<T>

  for (const name in mapping) {
    const Content: PopoverSignature = mapping[name]

    Popovers[name] = ({ data, ...popoverProps }) => {
      return (
        <Popover content={({ close }) => <Content data={data} close={close} />} {...popoverProps} />
      )
    }
  }

  return Popovers
}

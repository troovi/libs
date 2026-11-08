import {
  createContext,
  memo,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { hash } from '@companix/utils-js'

import { Dialog, DialogProps } from '../Dialog'
import { Drawer, DrawerProps } from '../Drawer'
import { MobileDrawer, MobileDrawerProps } from '..'

export interface PopupProps<T> {
  data: T
  close: () => void
}

// окно всегда рисует оболочку: её размонтирование реестр считает закрытием
type PopupSignature = (options: PopupProps<any>) => JSX.Element
type Store = { [name: string]: PopupSignature }

type UnwrapProps<T extends PopupSignature> = Parameters<T>[0] extends PopupProps<infer Q> ? Q : never

type OpenAgent<T extends Store> = {
  [P in keyof T]: (data: UnwrapProps<T[P]>) => void
}

type CloseAgent<T extends Store> = {
  [key in keyof T]: () => void
}

type PopupsRegistry<T extends Store> = {
  Overlay: () => JSX.Element
  Close: CloseAgent<T>
  Open: OpenAgent<T>
}

export const createPopupRegistry = <T extends Store>(mapping: T): PopupsRegistry<T> => {
  const Open = {} as OpenAgent<T>
  const Close = {} as CloseAgent<T>
  const popups: (() => JSX.Element)[] = []

  const context = hash()

  for (const name in mapping) {
    Open[name] = () => {}
    Close[name] = () => {}

    popups.push(() => <Popup Open={Open} Close={Close} name={name} Content={mapping[name]} />)
  }

  return {
    Open,
    Close,
    Overlay: () => (
      <>
        {popups.map((Popup, i) => {
          return <Popup key={`popup-${context}-${i}`} />
        })}
      </>
    )
  }
}

// overlay

interface SinglePopupProps<T extends Store> {
  name: keyof T
  Open: OpenAgent<T>
  Close: CloseAgent<T>
  Content: PopupSignature
}

const Popup = <T extends Store>({ name, Open, Close, Content }: SinglePopupProps<T>) => {
  const [{ data, open }, setState] = useState({
    data: null as null | unknown,
    open: false
  })

  // в этом открытии окно уже показало ожидание (`DialogPending`)
  const pending = useRef(false)

  const onClose = useCallback(() => {
    setState(({ data }) => ({ data, open: false }))
  }, [])

  const onClosed = useCallback(() => {
    setState({ data: null, open: false })
  }, [])

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) onClose()
  }, [])

  useEffect(() => {
    Open[name] = (data) => {
      pending.current = false
      setState({ data, open: true })
    }

    Close[name] = onClose
  }, [])

  if (data) {
    return (
      <PopupContext.Provider value={{ open, onOpenChange, onClosed, pending }}>
        <ContentWraper data={data} close={onClose} Content={Content} />
      </PopupContext.Provider>
    )
  }

  return null
}

interface ContentWraperProps {
  Content: PopupSignature
  data: unknown
  close: () => void
}

const ContentWraper = memo(({ data, close, Content }: ContentWraperProps) => {
  return <Content data={data} close={close} />
})

interface PopupContextValue {
  open: boolean
  onOpenChange: (value: boolean) => void
  onClosed: () => void
  /** В этом открытии окно уже показало ожидание: следующая оболочка появляется без анимации. */
  pending: MutableRefObject<boolean>
}

const PopupContext = createContext<PopupContextValue | null>(null)

export const usePopup = () => {
  const state = useContext(PopupContext)

  if (!state) {
    throw new Error('Popup context not provided')
  }

  return state
}

/* -------------------------------------------------------------------------------------------------
 * Dialog
 * -----------------------------------------------------------------------------------------------*/

interface DialogShellProps extends Omit<DialogProps, 'open' | 'onOpenChange' | 'onClosed' | 'instant'> {}

export const DialogShell = ({ children, ...props }: DialogShellProps) => {
  const { open, onOpenChange, onClosed, pending } = usePopup()

  // оболочка, сменившая ожидание открытого окна, появляется без анимации: окно уже на экране
  const [instant] = useState(() => open && pending.current)

  return (
    <Dialog open={open} onOpenChange={onOpenChange} onClosed={onClosed} {...props} instant={instant}>
      {children}
    </Dialog>
  )
}

/**
 * Окно, пока грузится код его содержимого: открывается и закрывается как окно реестра. Его размонтирование в открытом
 * окне — смена на `DialogShell` содержимого, она появляется без анимации и окно не закрывает; закрытое ожидание,
 * доиграв закрытие, закрывает окно — иначе реестр держал бы данные, и пришедшее после закрытия содержимое
 * смонтировалось бы скрытым и досталось следующему открытию.
 */
export const DialogPending = ({ children, ...props }: DialogShellProps) => {
  const { open, onOpenChange, onClosed, pending } = usePopup()

  // слушатель конца закрытия создаётся при монтировании — состояние окна он читает отсюда
  const isOpen = useRef(open)

  isOpen.current = open

  useLayoutEffect(() => {
    pending.current = true
  }, [])

  const handleClosed = () => {
    if (!isOpen.current) {
      onClosed()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} onClosed={handleClosed} {...props}>
      {children}
    </Dialog>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Drawer
 * -----------------------------------------------------------------------------------------------*/

interface DrawerShellProps extends Omit<DrawerProps, 'open' | 'onOpenChange' | 'onClosed'> {}

export const DrawerShell = ({ children, ...props }: DrawerShellProps) => {
  const { open, onOpenChange, onClosed } = usePopup()

  return (
    <Drawer open={open} onOpenChange={onOpenChange} onClosed={onClosed} {...props}>
      {children}
    </Drawer>
  )
}

/* -------------------------------------------------------------------------------------------------
 * DrawerMobile
 * -----------------------------------------------------------------------------------------------*/

interface MobileDrawerShellProps
  extends Omit<MobileDrawerProps, 'open' | 'onOpenChange' | 'onClosed'> {}

export const MobileDrawerShell = ({ children, ...props }: MobileDrawerShellProps) => {
  const { open, onOpenChange, onClosed } = usePopup()

  return (
    <MobileDrawer open={open} onOpenChange={onOpenChange} onClosed={onClosed} {...props}>
      {children}
    </MobileDrawer>
  )
}

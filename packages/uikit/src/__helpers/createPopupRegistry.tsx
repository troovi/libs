import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { hash } from '@companix/utils-js'

import { Dialog, DialogProps } from '../Dialog'
import { Drawer, DrawerProps } from '../Drawer'

export interface PopupProps<T> {
  data: T
  close: () => void
}

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
  const [{ data, open }, setState] = useState({ data: null as null | unknown, open: false })

  useEffect(() => {
    Open[name] = (data) => {
      setState({ data, open: true })
    }

    Close[name] = () => {
      if (open) {
        onClose()
      }
    }
  }, [])

  const onClose = useCallback(() => {
    setState(({ data }) => ({ data, open: false }))
  }, [])

  const onClosed = useCallback(() => {
    setState({ data: null, open: false })
  }, [])

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) onClose()
  }, [])

  if (data) {
    return (
      <PopupContext.Provider value={{ open, onOpenChange, onClosed }}>
        <Content data={data} close={onClose} />
      </PopupContext.Provider>
    )
  }

  return null
}

interface PopupContextValue {
  open: boolean
  onOpenChange: (value: boolean) => void
  onClosed: () => void
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

interface DialogShellProps extends Omit<DialogProps, 'open' | 'onOpenChange' | 'onClosed'> {}

export const DialogShell = ({ children, ...props }: DialogShellProps) => {
  const control = usePopup()

  return (
    <Dialog {...control} {...props}>
      {children}
    </Dialog>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Drawer
 * -----------------------------------------------------------------------------------------------*/

interface DrawerShellProps extends Omit<DrawerProps, 'open' | 'onOpenChange' | 'onClosed'> {}

export const DrawerShell = ({ children, ...props }: DrawerShellProps) => {
  const control = usePopup()

  return (
    <Drawer {...control} {...props}>
      {children}
    </Drawer>
  )
}

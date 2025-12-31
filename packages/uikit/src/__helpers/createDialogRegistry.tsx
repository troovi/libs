import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Dialog, DialogProps } from '../Dialog'
import { hash } from '@companix/utils-js'

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

export const createDialogsRegistry = <T extends Store>(mapping: T): PopupsRegistry<T> => {
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
      <DialogContext.Provider value={{ open, onOpenChange, onClosed }}>
        <Content data={data} close={onClose} />
      </DialogContext.Provider>
    )
  }

  return null
}

// dialog

interface PopupLayer extends Omit<DialogProps, 'open' | 'onOpenChange' | 'onClosed'> {}

interface DialogContextValue extends Pick<DialogProps, 'open' | 'onOpenChange' | 'onClosed'> {}

const DialogContext = createContext<DialogContextValue | null>(null)

const useDialog = () => {
  const state = useContext(DialogContext)

  if (!state) {
    throw new Error('Dialog context not provided')
  }

  return state
}

export const DialogShell = ({ children, ...props }: PopupLayer) => {
  const control = useDialog()

  return (
    <Dialog {...control} {...props}>
      {children}
    </Dialog>
  )
}

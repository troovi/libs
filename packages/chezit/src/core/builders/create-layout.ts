import type { SchemeItems } from '../types'

export type LayoutBuilder = (props: { children: React.ReactNode }) => React.ReactNode

export const createLayout = <P = void>(getLayout: (params: P) => LayoutBuilder) => {
  return (params: P) => {
    return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Layout<T> => {
      return {
        type: 'layout',
        Layout: getLayout(params),
        childs
      }
    }
  }
}

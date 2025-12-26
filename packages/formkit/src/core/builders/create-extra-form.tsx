import { SchemeItems } from '../types'

type Registry = <N extends string>(
  name: N
) => <T extends SchemeItems.All>(
  getItem: (name: N, remove: () => void) => T
) => SchemeItems.Registry<N, T>

export interface ExtraFormBuilder<
  N extends string,
  T extends SchemeItems.Registry<N, SchemeItems.All>[]
> {
  getItems: (registry: Registry) => T
  getController: (append: (name: N) => void, visable: N[]) => React.ReactNode
}

export const createExtraForm = <N extends string, T extends SchemeItems.Registry<N>[]>({
  getItems,
  getController
}: ExtraFormBuilder<N, T>): SchemeItems.Extra<N, T> => {
  return {
    type: 'extra',
    items: getItems((name) => {
      return (getForm) => ({
        type: 'registry',
        name,
        getForm
      })
    }),
    getController
  }
}

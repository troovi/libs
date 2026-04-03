import { SchemeItems } from './core/types'

export const Visablility = ({ hidden }: { hidden?: boolean }) => {
  return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Visablility<T> => {
    return {
      type: 'visability',
      hidden: hidden ?? false,
      childs
    }
  }
}

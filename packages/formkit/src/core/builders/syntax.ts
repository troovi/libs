import { SchemeItems } from '../types'

export const Context = <N extends string>(context: N) => {
  return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Context<N, T> => {
    return {
      type: 'context',
      context,
      childs
    }
  }
}

export const Condition = (depended: string, props: { canActivate: (value: any) => boolean }) => {
  return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Condition<T> => {
    return {
      type: 'condition',
      depended,
      canActivate: props.canActivate,
      childs
    }
  }
}

import { useValue } from './useValue'

interface Props {
  name: string
  canActivate: (value: any) => boolean
  children: React.ReactNode
}

/** Ветка `OptionalCondition` или `NullableCondition`: рисуется, пока `canActivate` верно для значения поля `name`. */
export const ConditionBranch = ({ canActivate, name, children }: Props) => {
  const value = useValue(name)

  if (canActivate(value)) {
    return <>{children}</>
  }

  return null
}

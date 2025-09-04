import { useValue } from './useValue'

interface Props {
  name: string
  canActivate: (value: any) => boolean
  children: React.ReactNode
}

export const Condition = ({ canActivate, name, children }: Props) => {
  const value = useValue(name)

  if (canActivate(value)) {
    return <>{children}</>
  }

  return null
}

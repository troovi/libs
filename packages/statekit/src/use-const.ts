import { useRef } from 'react'

/**
 * Значение, созданное один раз на жизнь компонента, — движок экрана. Экран отдаёт движок потомкам контекстом с
 * неизменным значением, поэтому сам контекст никого не перерисовывает.
 */
export const useConst = <T>(create: () => T) => {
  const ref = useRef<{ value: T } | null>(null)

  if (ref.current === null) {
    ref.current = { value: create() }
  }

  return ref.current.value
}

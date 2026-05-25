import { useState } from 'react'

export const useRerender = () => {
  const [, rerender] = useState(Symbol())
  return () => rerender(Symbol())
}

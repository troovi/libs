import { useState } from 'react'

export interface UseLoadingProps<T = unknown> {
  onClick: (startLoad: () => void, value: T) => Promise<any>
}

export const useLoading = <T = unknown>({ onClick }: UseLoadingProps<T>) => {
  const [state, setState] = useState({ isLoading: false, isError: false })

  const handleClick = (value: T) => {
    if (!state.isLoading) {
      const startLoad = () => {
        setState({ isLoading: true, isError: false })
      }

      onClick(startLoad, value)
        .then(() => {
          setState({ isLoading: false, isError: false })
        })
        .catch(() => {
          setState({ isLoading: false, isError: true })
        })
    }
  }

  return { ...state, handleClick }
}

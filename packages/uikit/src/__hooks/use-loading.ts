import { useState } from 'react'

export interface UseLoadingProps<T = unknown> {
  onClick: (startLoad: () => void, param: T) => Promise<any>
}

export const useLoading = <T = unknown>({ onClick }: UseLoadingProps<T>) => {
  const [state, setState] = useState({ isLoading: false, isError: false })

  const handleClick = (param: T) => {
    if (!state.isLoading) {
      onClick(() => setState({ isLoading: true, isError: false }), param)
        .then(() => {
          setState({
            isLoading: false,
            isError: false
          })
        })
        .catch((e) => {
          console.log(e)

          setState({
            isLoading: false,
            isError: true
          })
        })
    }
  }

  return {
    ...state,
    handleClick
  }
}

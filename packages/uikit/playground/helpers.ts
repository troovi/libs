import { UseOptionsResponse } from '@/index'
import { Option } from '@/types'
import { sleep } from '@companix/utils-js'
import { useEffect, useState } from 'react'

export const createOptions = (): Option<number>[] => {
  return [
    { value: 1, title: 'Vladimir Putin' },
    { value: 2, title: 'Donald Trump' },
    { value: 3, title: 'Sergey Lavrov' },
    { value: 4, title: 'Boris Johnson' },
    { value: 5, title: 'Joe Biden' },
    { value: 6, title: 'Kamala Haris' },
    ...new Array(12).fill(0).map((_, i) => ({
      title: `Option ${i}`,
      value: i + 7
    }))
  ]
}

export const useServerOptions = (timeout: number = 2500): UseOptionsResponse<number> => {
  const [{ isLoading, options }, setState] = useState({
    isLoading: true,
    options: [] as Option<number>[]
  })

  useEffect(() => {
    sleep(timeout).then(() => {
      setState({ options: createOptions(), isLoading: false })
    })
  }, [])

  return { options, isLoading }
}

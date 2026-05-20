import type { RawAxiosRequestHeaders } from 'axios'

interface Options {
  tokenSource?: string
}

export const getAuthorizationHeaders = (options: Options = {}): RawAxiosRequestHeaders => {
  return {
    Authorization: getAuthorizationToken(options.tokenSource)
  }
}

export const getAuthorizationToken = (tokenSource: string = 'token') => {
  const value = localStorage.getItem(tokenSource)

  if (value) {
    return `Bearer ${value}`
  }

  return ''
}

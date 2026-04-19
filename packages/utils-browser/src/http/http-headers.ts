import type { RawAxiosRequestHeaders } from 'axios'

interface Options {
  token?: string
  tokenSource?: string
}

export const getHeaders = ({ token, tokenSource }: Options = {}): RawAxiosRequestHeaders => {
  const Authorization = getAuthToken(token, tokenSource)

  const headers: RawAxiosRequestHeaders = {
    'Content-Type': 'application/json'
  }

  if (Authorization) {
    headers.Authorization = Authorization
  }

  return headers
}

export const getAuthToken = (token?: string, tokenSource: string = 'token') => {
  const value = token ?? localStorage.getItem(tokenSource)

  if (value) {
    return `Bearer ${value}`
  }

  return ''
}

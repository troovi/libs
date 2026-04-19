import type { RawAxiosRequestHeaders } from 'axios'

interface Options {
  multipart?: boolean
  token?: string
  tokenSource?: string
}

export const getHeaders = ({ token, tokenSource, multipart }: Options = {}): RawAxiosRequestHeaders => {
  const Authorization = getAuthToken(token, tokenSource)

  const headers: RawAxiosRequestHeaders = {
    'Content-Type': multipart ? 'multipart/form-data; charset=utf-8' : 'application/json'
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

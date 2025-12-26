interface Headers {
  Authorization?: string
  'Content-Type': string
}

interface Options {
  multipart?: boolean
  token?: string
  tokenStore?: string
}

export const getHeaders = ({ token, tokenStore, multipart }: Options = {}): Headers => {
  const Authorization = getAuthToken(token, tokenStore)

  const headers: Headers = {
    'Content-Type': multipart ? 'multipart/form-data; charset=utf-8' : 'application/json'
  }

  if (Authorization) {
    headers.Authorization = Authorization
  }

  return headers
}

export const getAuthToken = (token?: string, tokenStore: string = 'token') => {
  const value = token ?? localStorage.getItem(tokenStore)

  if (value) {
    return `Bearer ${value}`
  }

  return ''
}

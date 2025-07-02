import { AuthStrategy } from '../../api'
import { getBase64Signature } from '../../crypto'

interface Options {
  apiKey: string
  apiSecret: string
  host: string
}

export const createAuthStrategy = ({ apiKey, apiSecret, host }: Options): AuthStrategy => {
  return (method, endpoint, options) => {
    const getTimestamp = () => {
      return new Date().toISOString().replace(/\.\d{3}Z$/, '')
    }

    const params = new URLSearchParams({
      AccessKeyId: apiKey,
      SignatureMethod: 'HmacSHA256',
      SignatureVersion: '2',
      Timestamp: getTimestamp(),
      ...options
    })

    const prehash = [method, host, endpoint, params.toString()]

    params.append('Signature', getBase64Signature(apiSecret, prehash.join('\n')))

    return {
      method,
      url: `${endpoint}?${params.toString()}`
    }
  }
}

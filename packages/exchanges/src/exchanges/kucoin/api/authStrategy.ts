import { isEmpthy, sortObject } from '../../../utils'
import { AuthStrategy } from '../../../api'
import { getBase64Signature } from '../../../crypto'

interface Options {
  apiKey: string
  apiSecret: string
  apiPassword: string
}

export const createAuthStratrgy = ({ apiKey, apiPassword, apiSecret }: Options): AuthStrategy => {
  return (method, endpoint, options) => {
    const query = new URLSearchParams(sortObject(options))

    const timestamp = Date.now().toString()
    const url = method === 'GET' ? `${endpoint}?${noramlizeQuery(query.toString())}` : endpoint
    const params: Record<string, object | string> = {}

    const prehash = [timestamp, method, url]

    if (method !== 'GET' && !isEmpthy(options)) {
      prehash.push(JSON.stringify(options))
      params.body = options
    }

    return {
      method,
      url,
      ...params,
      headers: {
        'KC-API-KEY': apiKey,
        'KC-API-SIGN': getBase64Signature(apiSecret, prehash.join('')),
        'KC-API-TIMESTAMP': timestamp,
        'KC-API-PASSPHRASE': getBase64Signature(apiSecret, apiPassword),
        'KC-API-KEY-VERSION': '3'
      }
    }
  }
}

const noramlizeQuery = (query: string) => {
  return query.replace(/%2C/g, ',')
}

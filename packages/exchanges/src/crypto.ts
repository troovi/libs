import crypto from 'crypto'

export const getHexSignature = (secret: string, query: string) => {
  return crypto.createHmac('sha256', secret).update(query).digest('hex')
}

export const getBase64Signature = (secret: string, query: string) => {
  return crypto.createHmac('sha256', secret).update(query).digest('base64')
}

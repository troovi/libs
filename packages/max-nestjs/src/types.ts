import type { Request } from 'express'
import type { MaxBridgeInitData, MaxBridgeInitDataChat, MaxBridgeInitDataUser } from 'max-bridge'

export type MaxUserData = MaxBridgeInitDataUser

export interface MaxInitData
  extends Omit<Partial<MaxBridgeInitData>, 'hash' | 'auth_date' | 'user' | 'chat'> {
  hash: MaxBridgeInitData['hash']
  auth_date: MaxBridgeInitData['auth_date']
  user: MaxUserData
  chat?: MaxBridgeInitDataChat
}

export interface MaxRequest extends Request {
  maxInitData: MaxInitData
}

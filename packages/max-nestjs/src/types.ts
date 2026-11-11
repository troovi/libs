import type { Context } from '@maxhub/max-bot-api'
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

/** Обновление бота MAX — то, что приходит опросом или webhook. */
export type MaxUpdate = Context['update']

/** Сообщение бота MAX: новое (`message_created`), правка, нажатие кнопки. */
export type MaxMessage = Extract<MaxUpdate, { update_type: 'message_created' }>['message']

/** Вложение сообщения MAX: фото, видео, аудио, файл, стикер, контакт, ссылка, геопозиция, клавиатура. */
export type MaxAttachment = NonNullable<MaxMessage['body']['attachments']>[number]

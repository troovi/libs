import { AvatarSize } from './types'

const MAX_FONT_SIZE = 30
const MAX_IMAGE_BASE_SIZE: AvatarSize = 96
const RELATIVE_SIZE = MAX_FONT_SIZE / MAX_IMAGE_BASE_SIZE

export type GetInitialsFontSizeType = (avatarSize: number) => number

/**
 * Возвращает размер текста основанный на дизайн-системы.
 *
 * @param imageSize Наименьшая сторона изображения.
 */
export const getInitialsFontSize: GetInitialsFontSizeType = (avatarSize) => {
  if (avatarSize <= 16) {
    return 5
  } else if (avatarSize <= 24) {
    return 8
  } else if (avatarSize <= 32) {
    return 10
  } else if (avatarSize <= 36) {
    return 13
  } else if (avatarSize <= 44) {
    return 14
  } else if (avatarSize <= 48) {
    return 17
  } else if (avatarSize < 56) {
    return 18
  } else if (avatarSize <= 64) {
    return 21
  } else if (avatarSize <= 88) {
    return 26
  } else if (avatarSize <= MAX_IMAGE_BASE_SIZE) {
    return MAX_FONT_SIZE
  }

  const calculatedFontSize = Math.ceil(avatarSize * RELATIVE_SIZE)
  const evenFix = calculatedFontSize % 2
  return calculatedFontSize + evenFix
}

/**
 * Возвращает размер иконки основанный на дизайн-системы.
 *
 * @param imageSize Наименьшая сторона изображения.
 */
export function getFallbackIconSizeByImageBaseSize(imageSize: number): 12 | 16 | 20 | 24 | 28 | 36 {
  if (imageSize <= 20) {
    return 12
  } else if (imageSize > 20 && imageSize <= 28) {
    return 16
  } else if (imageSize > 28 && imageSize <= 32) {
    return 20
  } else if (imageSize > 32 && imageSize <= 44) {
    return 24
  } else if (imageSize > 44 && imageSize <= 64) {
    return 28
  }
  return getFallbackIconSizeByImageBaseSize.MAX_SIZE
}
export declare namespace getFallbackIconSizeByImageBaseSize {
  export let MAX_SIZE: 36
}

getFallbackIconSizeByImageBaseSize.MAX_SIZE = 36

/**
 * Возвращает размер иконки основанный на дизайн-системы.
 *
 * @param imageSize Наименьшая сторона изображения.
 */
export function getBadgeIconSizeByImageBaseSize(imageSize: number): 12 | 16 | 20 | 24 {
  if (imageSize <= 36) {
    return 12
  } else if (imageSize > 36 && imageSize <= 48) {
    return 16
  } else if (imageSize > 48 && imageSize <= 64) {
    return 20
  }
  return getBadgeIconSizeByImageBaseSize.MAX_SIZE
}
export declare namespace getBadgeIconSizeByImageBaseSize {
  export let MAX_SIZE: 24
}

getBadgeIconSizeByImageBaseSize.MAX_SIZE = 24 as const

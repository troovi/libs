export const avatarSizes = [16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 88, 96] as const

export type AvatarSize = (typeof avatarSizes)[number]

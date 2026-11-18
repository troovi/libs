import cn from 'classnames'
import { useState } from 'react'
import { box } from '@companix/utils-browser'
import { getInitialsFontSize } from './helpers'
import { AvatarSize } from './types'

/**
 * Размер по умолчанию.
 */
const defaultSize = 24

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLElement> {
  /**
   * Задаёт размер картинки.
   *
   * Используйте размеры заданные дизайн-системой `16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 56 | 64 | 72 | 80 | 88 | 96`.
   *
   * > ⚠️ Использование кастомного размера – это пограничный кейс.
   */
  size?: AvatarSize
  /**
   * Отключает обводку.
   */
  noBorder?: boolean
  /**
   * Фолбек на случай, если картинка не прогрузилась.
   * Предпочтительней использовать иконки из `@companix/icons`.
   * Может перекрывать `children`.
   */
  fallbackIcon?: React.ReactElement
  /**
   * Инициалы пользователя.
   *
   * > Note: Если аватарка не прогрузится, то пользователь увидит инициалы.
   *
   * > ⚠️ Перебивает `fallbackIcon`.
   */
  initials?: string
}

export const Avatar = ({
  alt,
  crossOrigin,
  decoding,
  loading,
  referrerPolicy,
  sizes,
  size = defaultSize,
  src,
  srcSet,
  useMap,
  initials,
  noBorder,
  fallbackIcon: fallbackIconProp,
  className,
  children
}: AvatarProps) => {
  const source = src || srcSet

  // источник, который не загрузился (404, нет сети): вместо пустого круга — инициалы или иконка, как у ImageBase VKUI;
  // новый `src` снова пробует загрузку без эффекта сброса
  const [failedSource, setFailedSource] = useState<string>()
  const hasSrc = Boolean(source) && failedSource !== source

  const _fallbackIcon = initials ? (
    <div className="avatar-initials" style={{ fontSize: getInitialsFontSize(size) }}>
      {initials}
    </div>
  ) : (
    fallbackIconProp
  )

  const fallbackIcon = !hasSrc ? _fallbackIcon : null

  return (
    <div className={cn('avatar', className)} style={box(size)}>
      {hasSrc && (
        <img
          alt={alt}
          className="avatar-image"
          crossOrigin={crossOrigin}
          decoding={decoding}
          loading={loading}
          referrerPolicy={referrerPolicy}
          sizes={sizes}
          src={src}
          srcSet={srcSet}
          useMap={useMap}
          onError={() => setFailedSource(source)}
        />
      )}
      {fallbackIcon && <div className="avatar-icon">{fallbackIcon}</div>}
      {children && <div className="avatar-content">{children}</div>}
      {!noBorder && <div className="avatar-border" />}
    </div>
  )
}

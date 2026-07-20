import cn from 'classnames'
import { useMemo, useRef, useState } from 'react'

export interface ImageBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string
  previewSrc?: string
  maskWidth: number
  maskHeight: number
  enableAspectRatio?: boolean
  imgAttrs?: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'className'>
}

/**
 * Rich компонент картинки, улучшающий и облегчающий отрисовку
 *
 * — Добавляет прозрачный плейсхолдер, поддерживающий размер и форму картинки, пока сама картинка
 * еще загружается, не мешая видеть постепенную загрузку картинки. Это предотвращает всевозможные
 * скачки при загрузке
 *
 * — Рисует заблюренную фотографию в минимальном разрешении, выступая в качестве превью
 * пока основная более тяжелая фотография загружается. Основная картинка будет постепенно
 * рисоваться поверх заблюренной фотографии
 *
 * — Обрабатывает ошибку загрузки картинки и позволяет повторить загрузку
 */

export const ImageBase = (props: ImageBaseProps) => {
  const {
    previewSrc,
    maskHeight,
    maskWidth,
    className,
    src,
    children,
    enableAspectRatio,
    imgAttrs,
    ...containerProps
  } = props

  const imgRef = useRef<HTMLImageElement>(null)

  const placeholderUrl = useMemo(() => {
    return generateSvgPlaceholderUrl(maskWidth, maskHeight)
  }, [maskWidth, maskHeight])

  const [isLoaded, setIsLoaded] = useState(false)
  const [isFailed, setIsFailed] = useState(false)
  const [isPreviewFailed, setIsPreviewFailed] = useState(false)

  const handleFailed = () => {
    if (isFailed) {
      setIsFailed(false)
      setIsPreviewFailed(false)
    }
  }

  return (
    <div
      className={cn('image-base', { 'image-base-loading': !isLoaded }, className)}
      style={enableAspectRatio ? { aspectRatio: maskWidth / maskHeight } : {}}
      onClickCapture={handleFailed}
      {...containerProps}
    >
      {!isLoaded && <img className="image-base-placeholder" src={placeholderUrl} alt="" />}
      {previewSrc && previewSrc !== src && !isLoaded && !isPreviewFailed && (
        <img
          className="image-base-preview"
          src={previewSrc}
          style={{ maxWidth: `${maskWidth}px`, maxHeight: `${maskHeight}px` }}
          loading="lazy"
          decoding="async"
          onError={() => setIsPreviewFailed(true)}
          alt=""
        />
      )}
      <img
        ref={imgRef}
        className="image-base-img"
        src={src}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsFailed(true)}
        {...imgAttrs}
        alt=""
      />
      {children}
    </div>
  )
}

const generateSvgPlaceholderUrl = (width: number, height: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" />`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

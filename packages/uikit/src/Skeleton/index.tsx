export interface SkeletonProps extends Pick<React.CSSProperties, 'width' | 'height' | 'borderRadius'> {}

/**
 * > Старайтесь минимизировать количество заглушек на экране. Не каждый элемент
 * > на экране должен заменяться заглушкой.
 * >
 * > Текстовые блоки лучше сокращать до трёх строк. Ширина последней строки
 * > скелета вычисляется, как 75% от ширины текстового блока. Высота скелетона
 * > автоматически подстраивается под размер шрифта, поэтому идеально
 * > вписывается в слоты компонентов, которые обычно ожидают текст.
 *
 * @since 6.1.0
 *
 * @see https://vkui.io/components/skeleton
 *
 */
export const Skeleton = ({ ...styles }: SkeletonProps) => {
  return (
    <span className="skeleton" style={styles}>
      <>&zwnj;</>
    </span>
  )
}

import { Button, ButtonProps } from '../Button'
import { UseLoadingProps, useLoading } from '../__hooks/use-loading'

export interface LoadButtonProps extends UseLoadingProps, Omit<ButtonProps, 'onClick'> {}

export const LoadButton = ({ onClick, accent = 'primary', ...rest }: LoadButtonProps) => {
  const { isLoading, isError, handleClick } = useLoading({ onClick })

  return (
    <Button
      accent={isError ? 'danger' : accent}
      {...rest}
      isLoading={isLoading}
      onClick={handleClick}
    />
  )
}

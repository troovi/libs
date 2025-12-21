import { Button, ButtonProps } from '../Button'
import { UseLoadingProps, useLoading } from '../__hooks/use-loading'

export interface LoadButtonProps extends UseLoadingProps, Omit<ButtonProps, 'onClick'> {}

export const LoadButton = ({ onClick, appearance = 'primary', ...rest }: LoadButtonProps) => {
  const { isLoading, isError, handleClick } = useLoading({ onClick })

  return (
    <Button
      appearance={isError ? 'negative' : appearance}
      {...rest}
      loading={isLoading}
      onClick={handleClick}
    />
  )
}

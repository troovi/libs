import { Button, ButtonProps } from '../Button'
import { UseLoadingProps, useLoading } from '../__hooks/use-loading'

export interface LoadingButtonProps extends UseLoadingProps, Omit<ButtonProps, 'onClick'> {}

export const LoadingButton = ({ onClick, appearance = 'primary', ...rest }: LoadingButtonProps) => {
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

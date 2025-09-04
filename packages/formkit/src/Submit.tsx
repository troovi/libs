import { Accent, LoadButton } from '@troovi/uikit'

export interface SubmitProps {
  accent?: Accent
  submitText?: string
  handleSubmit: () => Promise<void>
  fill?: boolean
}

export const Submit = ({ accent, fill, submitText, handleSubmit }: SubmitProps) => {
  return (
    <LoadButton
      accent={accent}
      fill={fill}
      onClick={async (start) => {
        start()
        await handleSubmit()
      }}
    >
      {submitText ?? 'Сохранить'}
    </LoadButton>
  )
}

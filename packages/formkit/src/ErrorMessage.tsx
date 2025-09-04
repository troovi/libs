import { FieldError } from '@troovi/chezit'

export const ErrorMessage = ({ error }: { error: FieldError | null }) => {
  if (error) {
    if (error.messages) {
      return (
        <>
          {error.messages.map((message, i) => (
            <div key={`error-message-${i}`} className="form-group-error">
              <div className="error-message">{message}</div>
            </div>
          ))}
        </>
      )
    }
  }

  return null
}

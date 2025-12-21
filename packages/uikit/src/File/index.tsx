import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useRef } from 'react'

export interface FileOverlayProps {
  multiple?: true
  onChange?: (file: File[]) => void
  children: React.ReactNode
  mimes?: string[]
  disabled?: boolean
  className?: string
}

const FileOverlay = ({
  onChange,
  disabled,
  mimes,
  children,
  multiple,
  className
}: FileOverlayProps) => {
  const ref = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return
    }

    if (e.target.files) {
      onChange?.(Array.from(e.target.files))
    }

    if (ref.current) {
      ref.current.value = ''
    }
  }

  return (
    <label className={className}>
      {children}
      <VisuallyHidden asChild>
        <input
          ref={ref}
          hidden
          type="file"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          aria-autocomplete="none"
          multiple={multiple}
          accept={(mimes ?? []).join(', ')}
          onChange={handleChange}
          disabled={disabled}
        />
      </VisuallyHidden>
    </label>
  )
}

export { FileOverlay }

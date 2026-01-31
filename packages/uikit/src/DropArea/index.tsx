import classNames from 'classnames'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export interface DropTargetProps {
  title: string
  text?: string
  icon: React.ReactNode
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
}

const DropTarget = ({ title, icon, text, onDrop }: DropTargetProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onDrop={onDrop}
      onDragEnter={() => setIsHovered(true)}
      onDragLeave={() => setIsHovered(false)}
      className={classNames('drop-target', {
        'drop-target-hovered': isHovered
      })}
    >
      <div className="drop-target-border">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" rx="8px" ry="8px" width="100%" height="100%" />
        </svg>
      </div>
      <div className="drop-target-area">
        <i className="drop-target-icon">{icon}</i>
        <div className="drop-target-info">
          <span className="drop-target-title">{title}</span>
          <span className="drop-target-text">{text}</span>
        </div>
      </div>
    </div>
  )
}

interface DropAreaContextValue {
  isVisable: boolean
  onHide: () => void
}

interface DragContextValue {
  onDragEnter: (event: React.DragEvent<HTMLDivElement>) => void
}

const DropAreaContext = createContext({} as DropAreaContextValue)
const DragContext = createContext({} as DragContextValue)

export interface DropAreaProps extends Omit<DropTargetProps, 'onDrop'> {
  onFilesAdd: (files: File[]) => void
}

export const DropArea = ({ onFilesAdd, ...props }: DropAreaProps) => {
  const { onHide, isVisable } = useContext(DropAreaContext)

  const [isDragging, setIsDragging] = useState(false)

  // Prevent default drag behavior
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  // Handle drag leave with Safari-specific workaround
  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.stopPropagation()
      // Standard browsers: check if leaving to outside
      const { relatedTarget } = event
      if (relatedTarget instanceof HTMLElement && relatedTarget?.matches('.drop-target, .drop-area')) {
        return
      }

      onHide()
    },
    [isDragging, onHide]
  )

  // Handle file drop
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const allFiles: File[] = [...Array.from(event.dataTransfer.files)]

      if (allFiles.length) {
        onFilesAdd(allFiles)
      }

      onHide()
    },
    [onFilesAdd, onHide]
  )

  return (
    <div
      onDragStart={() => setIsDragging(true)}
      onDragEnter={() => setIsDragging(true)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={classNames('drop-area', {
        'drop-area-hidden': !isVisable
      })}
      onDrop={() => {
        onHide()
        setIsDragging(false)
      }}
    >
      {isVisable && <DropTarget {...props} onDrop={handleDrop} />}
    </div>
  )
}

export const DropAreaProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVisable, setVisable] = useState(false)

  const handleDropArea = useCallback(() => {
    setVisable(false)
  }, [])

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    const { items } = event.dataTransfer
    // Filter out text/URI items, keep only files
    const fileItems = Array.from(items).filter(
      ({ type, kind }) => type !== 'text/uri-list' && kind !== 'string'
    )
    if (fileItems.length) {
      setVisable(true)
    }
  }, [])

  const value: DragContextValue = useMemo(() => {
    return {
      onDragEnter: handleDragEnter
    }
  }, [])

  return (
    <DropAreaContext.Provider value={{ isVisable, onHide: handleDropArea }}>
      <DragContext.Provider value={value}>{children}</DragContext.Provider>
    </DropAreaContext.Provider>
  )
}

export const useDragEnter = () => {
  const { onDragEnter } = useContext(DragContext)

  if (!onDragEnter) {
    throw new Error('useDragContext should be within context')
  }

  return onDragEnter
}

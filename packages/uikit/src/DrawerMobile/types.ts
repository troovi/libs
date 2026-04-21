import type * as DialogPrimitive from '@radix-ui/react-dialog'

export type MobileDrawerContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  size?: string
}

export type MobileDrawerOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>

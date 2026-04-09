import { IType } from '@companix/xeo-scheme'

export interface MutationEvent {
  type: 'create' | 'update' | 'remove'
  model: string
  id: IType
  /** Patch addresses that changed (only present for 'update' events) */
  fields?: string[]
}

export type MutationListener = (event: MutationEvent) => void

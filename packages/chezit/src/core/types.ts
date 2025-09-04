import { LayoutBuilder } from './builders/create-layout'
import { FormBuilder } from './builders/create-form'

export interface FieldError {
  error: boolean
  messages?: string[]
}

export namespace SchemeItems {
  export type All = Form | Layout | Context | Condition | Extra

  export interface Form<N extends string = string, V extends any = any, P extends any = any> {
    type: 'form'
    name: N
    defaultValue: V
    validate: (value: V) => FieldError | void
    Form: ReturnType<FormBuilder<P, V>['getForm']>
  }

  export interface Layout<T extends All[] = All[]> {
    type: 'layout'
    Layout: LayoutBuilder
    childs: T
  }

  export interface Context<N extends string = string, T extends All[] = All[]> {
    type: 'context'
    context: N
    childs: T
  }

  export interface Extra<N extends string = string, T extends Registry<N>[] = Registry<N>[]> {
    type: 'extra'
    items: T
    getController: (append: (name: N) => void, visable: N[]) => React.ReactNode
  }

  export interface Registry<N extends string = string, T extends All = All> {
    type: 'registry'
    name: N
    getForm: <Q extends N>(name: Q, remove: () => void) => T
  }

  export interface Condition<T extends All[] = All[]> {
    type: 'condition'
    depended: string
    canActivate: (value: any) => boolean
    childs: T
  }
}

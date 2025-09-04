export type RefCallBack = (instance: any) => void

export type FieldValues = Record<string, any>

export type ExtractObjects<T> = T extends infer U ? (U extends object ? U : never) : never

declare const $NestedValue: unique symbol

export type BrowserNativeObject = Date | FileList | File

export type NestedValue<TValue extends object = object> = {
  [$NestedValue]: never
} & TValue

export type DeepPartial<T> = T extends BrowserNativeObject | NestedValue
  ? T
  : {
      [K in keyof T]?: ExtractObjects<T[K]> extends never ? T[K] : DeepPartial<T[K]>
    }

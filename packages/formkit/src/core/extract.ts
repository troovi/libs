import { SchemeItems } from './types'
import { Compute, UnionToIntersection } from '../utils/typescript'

// имена ветки NullableCondition: скрытая ветка отдаёт им null
type OrNull<T> = { [K in keyof T]: T[K] | null }

// значения: raw — как есть (onChange, getValues, defaultValues), submit — после проверки полей (onSubmit)
type Mode = 'raw' | 'submit'

// после проверки обязательное поле без пустого (null, undefined); [R] — без распределения по boolean
type CheckedValue<V, R> = [R] extends [true] ? NonNullable<V> : V

type FieldValue<V, R, M extends Mode> = M extends 'submit' ? CheckedValue<V, R> : V

type ExtractValue<T, M extends Mode = 'raw'> = T extends SchemeItems.Form<infer N, infer V, any, infer R>
  ? { [K in N]: FieldValue<V, R, M> }
  : T extends SchemeItems.Layout<infer C>
  ? ExtractValue<C[number], M>
  : T extends SchemeItems.Context<infer N, infer C>
  ? { [K in N]: Compute<UnionToIntersection<ExtractValue<C[number], M>>> }
  : T extends SchemeItems.Condition<infer C, true>
  ? OrNull<ExtractValue<C[number], M>>
  : T extends SchemeItems.Condition<infer C>
  ? Partial<ExtractValue<C[number], M>>
  : T extends SchemeItems.Visablility<infer C>
  ? Partial<ExtractValue<C[number]>> // поле скрытой visability уходит без проверки — значения как есть
  : T extends SchemeItems.Extra<string, infer C>
  ? Partial<ExtractValue<ReturnType<C[number]['getForm']>, M>>
  : never

type ExtractValues<T> = Compute<UnionToIntersection<ExtractValue<T>>>

type ExtractSubmitValues<T> = Compute<UnionToIntersection<ExtractValue<T, 'submit'>>>

type ExtractFlatValue<T, A extends string | null> = T extends SchemeItems.Form<infer N, infer V>
  ? { [K in A extends null ? N : `${A}.${N}`]: V }
  : T extends SchemeItems.Layout<infer C>
  ? ExtractFlatValue<C[number], A>
  : T extends SchemeItems.Context<infer N, infer C>
  ? ExtractFlatValue<C[number], A extends null ? N : `${A}.${N}`>
  : T extends SchemeItems.Condition<infer C>
  ? Partial<ExtractFlatValue<C[number], A>>
  : T extends SchemeItems.Visablility<infer C>
  ? Partial<ExtractFlatValue<C[number], A>>
  : T extends SchemeItems.Extra<string, infer C>
  ? Partial<ExtractValue<ReturnType<C[number]['getForm']>>> // todo: проверить
  : never

type ExtractFlatValues<T> = Compute<UnionToIntersection<ExtractFlatValue<T, null>>>

export type { ExtractValues, ExtractSubmitValues, ExtractFlatValues }

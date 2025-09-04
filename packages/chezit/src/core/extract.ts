import { SchemeItems } from './types'
import { Compute, UnionToIntersection } from '../utils/typescript'

type ExtractValue<T> =
  T extends SchemeItems.Form<infer N, infer V>
    ? { [K in N]: V }
    : T extends SchemeItems.Layout<infer C>
      ? ExtractValue<C[number]>
      : T extends SchemeItems.Context<infer N, infer C>
        ? { [K in N]: Compute<UnionToIntersection<ExtractValue<C[number]>>> }
        : T extends SchemeItems.Condition<infer C>
          ? Partial<ExtractValue<C[number]>>
          : T extends SchemeItems.Extra<string, infer C>
            ? Partial<ExtractValue<ReturnType<C[number]['getForm']>>>
            : never

type ExtractValues<T> = Compute<UnionToIntersection<ExtractValue<T>>>

type ExtractFlatValue<T, A extends string | null> =
  T extends SchemeItems.Form<infer N, infer V>
    ? { [K in A extends null ? N : `${A}.${N}`]: V }
    : T extends SchemeItems.Layout<infer C>
      ? ExtractFlatValue<C[number], A>
      : T extends SchemeItems.Context<infer N, infer C>
        ? ExtractFlatValue<C[number], A extends null ? N : `${A}.${N}`>
        : T extends SchemeItems.Condition<infer C>
          ? Partial<ExtractFlatValue<C[number], A>>
          : T extends SchemeItems.Extra<string, infer C>
            ? Partial<ExtractValue<ReturnType<C[number]['getForm']>>>
            : never

type ExtractFlatValues<T> = Compute<UnionToIntersection<ExtractFlatValue<T, null>>>

export type { ExtractValues, ExtractFlatValues }

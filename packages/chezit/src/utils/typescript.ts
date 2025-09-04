// Typescript Utilities

// #1
// Transform union type to intersection type

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer R) => void
  ? R
  : never

// # 2
// Computing type to readable format

type Compute<T> = {} & { [P in keyof T]: T[P] }

export type { UnionToIntersection, Compute }

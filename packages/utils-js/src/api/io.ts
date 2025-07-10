export type IOpattern<T extends IOpattern<T>> = {
  [key in keyof T]: {
    params: T[key]['params']
    answer: T[key]['answer']
  }
}

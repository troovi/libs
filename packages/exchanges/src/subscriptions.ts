interface SubscriptionsOptions<T, R> {
  subscriptions: T
  getStreams: (r: R) => string[]
}

export class Subscriptions<T = any, R = any> {
  public subscriptions: T
  public getStreams: (r: R) => string[]

  constructor({ subscriptions, getStreams }: SubscriptionsOptions<T, R>) {
    this.subscriptions = subscriptions
    this.getStreams = getStreams
  }
}

export type ExtractA<T> = T extends Subscriptions<infer A, infer B> ? A : never
export type ExtractB<T> = T extends Subscriptions<infer A, infer B> ? B : never

import {
  DataScheme,
  Identifier,
  InferScheme,
  Model,
  Prop,
  defineCollection
} from '@companix/xeo-scheme'

@Model({})
export class Settings {
  @Identifier({ type: 'string' })
  id: string

  @Prop({ type: 'number' })
  lastNofitReadId: number
}

export const SystemDataScheme = new DataScheme({
  settings: defineCollection(Settings, 'id')
})

export type SystemScheme = InferScheme<typeof SystemDataScheme>

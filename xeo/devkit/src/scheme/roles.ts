import { Identifier, Model, Prop } from '@companix/xeo-scheme'

export namespace RoleEntities {
  @Model({ name: 'Role' })
  export class Role {
    @Identifier({ type: 'string' })
    value: string

    @Prop({ type: 'string' })
    title: string

    @Prop({ type: 'number' })
    createdAt: number
  }
}

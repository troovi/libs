import { IType } from '../data-processor'

export namespace PatchActions {
  interface BasePatch {
    address: string
  }

  export interface Set extends BasePatch {
    type: 'set'
    value: unknown // maybe value, maybe null
  }

  // WARNING: не работает с вложенными массивами внутри массивов (работаем только с массивами идентификаторов)
  export interface Push extends BasePatch {
    type: 'push'
    items: IType[]
  }

  // WARNING: не работает с вложенными массивами внутри массивов (работаем только с массивами идентификаторов)
  export interface Pull extends BasePatch {
    type: 'pull'
    items: IType[] // { predicateKey: string | null; value: IType }
  }
}

export type UpdatePatch = PatchActions.Set | PatchActions.Push | PatchActions.Pull

export namespace CollectionDriverParams {
  export interface Model {
    model: string
  }

  export interface Record extends Model {
    id: IType
  }

  export interface Create extends Model {
    data: object
  }

  export interface Update extends Record {
    patches: UpdatePatch[]
  }

  export interface Filter extends Model {
    filter: object
  }
}

export abstract class CollectionDriver {
  tables: TableDriver
  getAll: (params: CollectionDriverParams.Model) => Promise<object[]>
  get: (params: CollectionDriverParams.Record) => Promise<object | null>
  create: (params: CollectionDriverParams.Create) => Promise<void>
  remove: (params: CollectionDriverParams.Record) => Promise<void>
  update: (params: CollectionDriverParams.Update) => Promise<void>
  exists: (params: CollectionDriverParams.Record) => Promise<boolean>
  findOneBy: (params: CollectionDriverParams.Filter) => Promise<object | null>
  findBy: (params: CollectionDriverParams.Filter) => Promise<object[]>
}

export interface TableRow {
  m1: IType
  m2: IType
}

export interface RelationsTableInfo {
  tableName: string
  rules: { m1: string; m2: string }
}

export interface TableRelationSlice {
  tableName: string
  modelSide: string // относительно какой модели
  modelId: IType // воспринимать данный id
}

export interface RelationRecord extends TableRelationSlice {
  oppositeId: IType
}

export abstract class TableDriver {
  getRecords: (_: TableRelationSlice) => Promise<IType[]>
  // при удалении модели
  removeRecordsByModel: (_: TableRelationSlice) => Promise<void>
  // при удалении связи (модели остаются)
  removeRecord: (_: RelationRecord) => Promise<void>
  createRecord: (_: RelationRecord) => Promise<void>
}

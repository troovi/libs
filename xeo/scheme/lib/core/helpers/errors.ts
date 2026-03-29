interface NotExists {
  reason: 'NOT_EXISTS'
}

interface Exists {
  reason: 'EXISTS'
}

interface RelationRestrict {
  reason: 'RELATION_RESTRICT'
  address: string
  info: string
}

interface DependencyRestrict {
  reason: 'DEPENDENCY_RESTRICT'
  model: string
}

export type CoreErrorData = Exists | NotExists | RelationRestrict | DependencyRestrict

export class CoreError {
  constructor(public model: string, public data: CoreErrorData) {}
}

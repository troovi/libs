import { TypeMetadataStorage } from '../storages/metadata.storage'

export interface DiscriminatedModelOptions {
  model: string
  discriminatorKey: string
}

// модель обязана иметь identifier-поле, характеризующее
export function DiscriminatedModel(options: DiscriminatedModelOptions): ClassDecorator {
  return function (target) {
    TypeMetadataStorage.addDiscriminatedModelMetadata({
      target,
      name: target.name,
      discriminatorKey: options.discriminatorKey,
      model: options.model
    })
  }
}

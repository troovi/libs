import { TypeMetadataStorage } from '../storages/metadata.storage'

export interface ModelOptions {}

// модель обязана иметь identifier-поле, характеризующее
export function Model(options: ModelOptions): ClassDecorator {
  return function (target) {
    TypeMetadataStorage.addModelMetadata({
      target,
      name: target.name,
      options
    })
  }
}

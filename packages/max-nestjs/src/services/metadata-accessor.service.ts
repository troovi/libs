import { Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  COMPOSER_METADATA,
  LISTENERS_METADATA,
  SCENE_METADATA,
  UPDATE_METADATA,
  WIZARD_STEP_METADATA
} from '../constants'
import { ListenerMetadata, SceneMetadata, WizardStepMetadata } from '../interfaces'

@Injectable()
export class MetadataAccessorService {
  constructor(private readonly reflector: Reflector) {}

  isComposer(target?: Function): boolean {
    return !!target && !!this.reflector.get(COMPOSER_METADATA, target)
  }

  isUpdate(target?: Function): boolean {
    return !!target && !!this.reflector.get(UPDATE_METADATA, target)
  }

  isScene(target?: Function): boolean {
    return !!target && !!this.reflector.get(SCENE_METADATA, target)
  }

  getListenerMetadata(target: Function): ListenerMetadata[] | undefined {
    return this.reflector.get(LISTENERS_METADATA, target)
  }

  getSceneMetadata(target: Function): SceneMetadata | undefined {
    return this.reflector.get(SCENE_METADATA, target)
  }

  getWizardStepMetadata(target: Function): WizardStepMetadata | undefined {
    return this.reflector.get(WIZARD_STEP_METADATA, target)
  }
}

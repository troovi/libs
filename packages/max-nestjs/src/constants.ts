import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'

// Метаданные классов/методов
export const UPDATE_METADATA = 'MAX_UPDATE_METADATA'
export const SCENE_METADATA = 'MAX_SCENE_METADATA'
export const COMPOSER_METADATA = 'MAX_COMPOSER_METADATA'
export const LISTENERS_METADATA = 'MAX_LISTENERS_METADATA'
export const WIZARD_STEP_METADATA = 'MAX_WIZARD_STEP_METADATA'

// DI-токены
export const MAX_MODULE_OPTIONS = 'MAX_MODULE_OPTIONS'
export const MAX_BOT_NAME = 'MAX_BOT_NAME'
export const MAX_STAGE = 'MAX_STAGE'
export const DEFAULT_BOT_NAME = 'DEFAULT_MAX_BOT'

// Метаданные параметров (переиспользуем nest-овский ключ ROUTE_ARGS)
export const PARAM_ARGS_METADATA = ROUTE_ARGS_METADATA

export const DEFAULT_MAX_INIT_DATA_HEADER = 'x-max-init-data'
export const MAX_WEB_APP_DATA_KEY = 'WebAppData'

/** Тип параметра обработчика, разрешаемый MaxParamsFactory. */
export enum MaxParamtype {
  CONTEXT,
  NEXT,
  SENDER,
  MESSAGE,
  PAYLOAD
}

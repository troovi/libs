import { Global, Module, type DynamicModule } from '@nestjs/common'
import {
  DEFAULT_MAX_AGE_SECONDS,
  DEFAULT_MAX_INIT_DATA_HEADER,
  MAX_OPTIONS_SYMBOL
} from './max.constants'
import type { MaxModuleOptions, MaxResolvedModuleOptions } from './max.interface'
import { MaxAuthGuard } from './max-auth.guard'

@Global()
@Module({})
export class MaxModule {
  public static forRoot(options: MaxModuleOptions): DynamicModule {
    return {
      module: MaxModule,
      providers: [
        {
          provide: MAX_OPTIONS_SYMBOL,
          useValue: normalizeOptions(options)
        },
        MaxAuthGuard
      ],
      exports: [MAX_OPTIONS_SYMBOL, MaxAuthGuard],
      global: true
    }
  }
}

function normalizeOptions(options: MaxModuleOptions): MaxResolvedModuleOptions {
  const botToken = options.botToken.trim()

  if (!botToken) {
    throw new Error('MAX bot token is required')
  }

  const headerName = options.headerName?.trim() || DEFAULT_MAX_INIT_DATA_HEADER
  const maxAgeSeconds = options.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS

  if (!Number.isInteger(maxAgeSeconds) || maxAgeSeconds < 0) {
    throw new Error('MAX maxAgeSeconds must be a non-negative integer')
  }

  return {
    botToken,
    headerName,
    maxAgeSeconds
  }
}

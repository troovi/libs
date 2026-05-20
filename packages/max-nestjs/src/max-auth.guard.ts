import {
  CanActivate,
  Inject,
  Injectable,
  UnauthorizedException,
  type ExecutionContext
} from '@nestjs/common'
import { MAX_OPTIONS_SYMBOL } from './max.constants'
import type { MaxResolvedModuleOptions } from './max.interface'
import type { MaxRequest } from './types'
import { MaxValidationService } from './max.validation'

@Injectable()
export class MaxAuthGuard implements CanActivate {
  public constructor(
    @Inject(MAX_OPTIONS_SYMBOL)
    private readonly options: MaxResolvedModuleOptions,
    private readonly maxValidationService: MaxValidationService
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<MaxRequest>()
    const rawInitData = request.headers[this.options.headerName]

    if (!rawInitData || typeof rawInitData !== 'string') {
      throw new UnauthorizedException('MAX init data is missing')
    }

    const initData = this.maxValidationService.verify(rawInitData)

    request.maxInitData = initData

    return true
  }
}

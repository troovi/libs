import {
  CanActivate,
  Inject,
  Injectable,
  UnauthorizedException,
  type ExecutionContext
} from '@nestjs/common'
import type { MaxRequest } from '../types'
import { MaxValidationService } from '../validation'
import { MaxModuleOptions } from '../interfaces'
import { DEFAULT_MAX_INIT_DATA_HEADER, MAX_MODULE_OPTIONS } from '../constants'

@Injectable()
export class MaxAuthGuard implements CanActivate {
  public constructor(
    @Inject(MAX_MODULE_OPTIONS)
    private readonly options: MaxModuleOptions,
    private readonly validationService: MaxValidationService
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<MaxRequest>()
    const rawInitData = request.headers[this.options.headerName ?? DEFAULT_MAX_INIT_DATA_HEADER]

    if (!rawInitData || typeof rawInitData !== 'string') {
      throw new UnauthorizedException('MAX init data is missing')
    }

    const initData = this.validationService.verify(rawInitData)

    request.maxInitData = initData

    return true
  }
}

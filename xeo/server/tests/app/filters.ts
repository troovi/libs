import { CoreError } from '@companix/xeo-scheme'
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    // core conflicts
    if (exception instanceof CoreError) {
      console.log('core exception:', exception)
      response.status(HttpStatus.BAD_REQUEST).json(exception)
      return
    }

    // internal server errors
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse())
      return
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(exception?.response)
  }
}

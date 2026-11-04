import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { Response } from 'express'
import { CoreError } from '@companix/xeo-scheme'
import { DomainError } from '@companix/xeo-toolkit'

/**
 * Отказы в один формат `{ code, message }`: HTTP-исключения — как есть, ошибка домена — 400
 * (неизвестная операция — 404), ошибка целостности xeo — 400 с моделью и причиной, остальное — 500 с
 * записью в лог.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse())
      return
    }

    if (exception instanceof DomainError) {
      const status = exception.code === 'notFound' ? 404 : 400

      response.status(status).json({ code: exception.code, message: exception.message })
      return
    }

    if (exception instanceof CoreError) {
      const { model, data } = exception

      response.status(400).json({
        code: 'integrity',
        message: `Целостность: ${model} — ${data.reason}`,
        model,
        data
      })
      return
    }

    Logger.error(exception instanceof Error ? exception.stack : String(exception), 'Sandbox')
    response.status(500).json({
      code: 'internal',
      message: 'Внутренняя ошибка сервера песочницы'
    })
  }
}

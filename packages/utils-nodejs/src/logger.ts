import { colors } from './colors'

export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal' | 'magneta'

interface Options {
  bold?: boolean
}

export class Logger {
  private write: (buffer: string) => void
  private pid: number = 8000

  constructor(private readonly service: string) {
    this.write = (buffer) => process.stdout.write(buffer)
    this.pid = process.pid
  }

  log(message: string, context: string) {
    this.print(message, context, 'log')
  }

  error(message: string, context: string) {
    this.print(message, context, 'error')
  }

  warn(message: string, context: string) {
    this.print(message, context, 'warn')
  }

  debug(message: string, context: string) {
    this.print(message, context, 'debug')
  }

  verbose(message: string, context: string, opts?: Options) {
    this.print(message, context, 'verbose', opts)
  }

  fatal(message: string, context: string) {
    this.print(message, context, 'fatal')
  }

  console(message: string, level: LogLevel, opts?: Options) {
    this.write(this.colorize(`${this.service}: ${message}`, level, opts) + '\n')
  }

  private print(message: string, context: string, logLevel: LogLevel, opts?: Options) {
    const log = this.colorize(logLevel.toUpperCase().padStart(7, ' '), logLevel)
    const ctx = colors.yellowBright(`[${context}]`)
    const text = this.colorize(message, logLevel, opts)
    const service = this.colorize(`[${this.service}]`, logLevel)
    const time = new Date().toLocaleTimeString('ru', { timeZone: 'UTC' })

    this.write(`${time} - ${this.pid} ${service} - ${log} ${ctx} ${text}\n`)
  }

  private colorize(message: string, logLevel: LogLevel, opts?: Options) {
    return this.getColorByLogLevel(logLevel, opts)(message)
  }

  private getColorByLogLevel(level: LogLevel, opts?: Options) {
    switch (level) {
      case 'debug':
        return colors.magentaBright
      case 'warn':
        return colors.yellow
      case 'error':
        if (opts?.bold) {
          return (text: string) => `\x1B[30m\x1B[41m${text}\x1B[0m`
        }

        return colors.red
      case 'verbose':
        if (opts?.bold) {
          return (text: string) => `\x1B[106m${text}\x1B[49m`
        }

        return colors.cyanBright
      case 'fatal':
        return colors.bold
      default:
        return colors.green
    }
  }
}

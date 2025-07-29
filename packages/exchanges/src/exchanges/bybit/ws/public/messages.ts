export namespace ByBitMessages {
  export interface DepthEvent {
    topic: `orderbook.${1 | 50 | 100}.${string}`
    type: 'snapshot' | 'delta'
    ts: number // метка времени генерации данных (раньше этой метки данные никто не получит)
    cts: number // метка времени данная движком (скорее всего равно последнему trade событию данных стакане)
    data: {
      s: string
      u: number
      seq: number
      b: string[][]
      a: string[][]
    }
  }

  export interface KlineEvent {
    topic: `kline.${1 | 5}.${string}`
    type: 'snapshot' | 'delta'
    data: [
      {
        start: number
        end: number
        interval: '1' | '5'
        open: string
        close: string
        high: string
        low: string
        volume: string
        turnover: string
        confirm: boolean
        timestamp: number
      }
    ]
    ts: number
  }
}

export type ByBitStreamEvents = ByBitMessages.DepthEvent | ByBitMessages.KlineEvent

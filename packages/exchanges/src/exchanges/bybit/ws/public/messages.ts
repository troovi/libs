export namespace StreamMessages {
  export interface DepthEvent {
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
}

export type StreamEvents = StreamMessages.DepthEvent

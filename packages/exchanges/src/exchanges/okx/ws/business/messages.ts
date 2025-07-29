export namespace OKXBusinessMessages {
  export interface Candle {
    arg: { channel: `candle${'1m' | '5m'}`; instId: string }
    data: [
      [
        string, // timestamp
        string, // open
        string, // high
        string, // low
        string, // close
        string, // volume
        string, // volCcy
        string // volCcyQuote
      ]
    ]
  }
}

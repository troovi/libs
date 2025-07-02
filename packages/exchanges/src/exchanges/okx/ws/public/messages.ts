export namespace OKXMessages {
  export interface Books {
    arg: { channel: 'books'; instId: string }
    action: 'update' | 'snapshot'
    data: [
      {
        asks: [string, string, string, string][]
        bids: [string, string, string, string][]
        ts: string
        checksum: number
        seqId: number
        prevSeqId: number
      }
    ]
  }
}

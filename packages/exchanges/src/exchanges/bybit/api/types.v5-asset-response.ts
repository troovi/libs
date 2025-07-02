export interface CoinInfoV5 {
  name: string
  coin: string
  remainAmount: string
  chains: {
    chain: string
    chainType: string
    confirmation: string
    withdrawFee: string
    depositMin: string
    withdrawMin: string
    minAccuracy: string
    chainDeposit: string
    chainWithdraw: string
    withdrawPercentageFee: string
    contractAddress: string
  }[]
}

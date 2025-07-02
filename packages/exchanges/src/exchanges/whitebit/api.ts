import axios from 'axios'

interface Coin {
  name: string // Market pair name
  stock: string // Ticker of stock currency
  money: string // Ticker of money currency
  stockPrec: string // Stock currency precision
  moneyPrec: string // Precision of money currency
  feePrec: string // Fee precision
  makerFee: string // Default maker fee ratio
  takerFee: string // Default taker fee ratio
  minAmount: string // Minimal amount of stock to trade
  minTotal: string // Minimal amount of money to trade
  maxTotal: string // Maximum total(amount * price) of money to trade
  tradesEnabled: boolean // Is trading enabled
  isCollateral: boolean // Is margin trading enabled
  type: 'spot' | 'futures' // Market type. Possible values: "spot", "futures"
}

interface Kline {
  success: boolean
  message: null
  result: [
    number, // Time in seconds
    string, // Open
    string, // Close
    string, // High
    string, // Low
    string, // Volume stock
    string // Volume money
  ][]
}

export class WhiteBitApi {
  private api = axios.create({
    baseURL: `https://whitebit.com`
  })

  private getMarkets() {
    return this.api.get<Coin[]>('/api/v4/public/markets').then(({ data }) => {
      return data
    })
  }

  private getKlines(market: string, start?: number, end?: number) {
    return this.api
      .get<Kline>('/api/v1/public/kline', {
        params: { market, start, end, interval: '1m' }
      })
      .then(({ data }) => data.result)
  }

  async getSpotSymbols(blacklist: string[] = []) {
    return (await this.getMarkets())
      .filter(({ type, money, stock }) => {
        return money === 'USDT' && type === 'spot' && !blacklist.includes(stock)
      })
      .map(({ name }) => name)
  }

  async getChart() {
    //
  }
}

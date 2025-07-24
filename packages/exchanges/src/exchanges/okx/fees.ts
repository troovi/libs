import { FeesApi } from '../../types'
import { OKXApi } from './api'

export const createOKXFees = (api: OKXApi): FeesApi => {
  return async (market, symbols) => {
    if (market === 'spot') {
      return Promise.all(
        symbols.map(async (symbol) => {
          const { data } = await api.handleRecvError(() => {
            return api.getFee({ instType: 'SPOT', instId: symbol })
          })

          return {
            symbol,
            takerCommission: +data[0].taker * -1,
            makerCommission: +data[0].maker * -1
          }
        })
      )
    }

    if (market === 'futures') {
      return Promise.all(
        symbols.map(async (symbol) => {
          const { data } = await api.handleRecvError(() => {
            return api.getFee({ instType: 'SWAP', uly: symbol })
          })

          return {
            symbol,
            takerCommission: +data[0].takerU * -1,
            makerCommission: +data[0].makerU * -1
          }
        })
      )
    }

    return []
  }
}

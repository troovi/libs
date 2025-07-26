import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    /**
     * Aggregate Trade Streams<br>
     *
     * The Aggregate Trade Streams push trade information that is aggregated for a single taker order.<br>
     *
     * Stream Name: &lt;symbol&gt;@aggTrade <br>
     * Update Speed: Real-time<br>
     *
     * {@link https://binance-docs.github.io/apidocs/spot/en/#aggregate-trade-streams}
     *
     * @param {string} symbol
     */
    aggTrade: ({ symbol }: { symbol: string }) => {
      return `${symbol.toLowerCase()}@aggTrade`
    },

    /**
     * Trade Streams<br>
     *
     * The Trade Streams push raw trade information; each trade has a unique buyer and seller.<br>
     *
     * Stream Name: &lt;symbol&gt;@trade <br>
     * Update Speed: Real-time<br>
     *
     * {@link https://binance-docs.github.io/apidocs/spot/en/#trade-streams}
     *
     * @param {string} symbol
     */
    trade: ({ symbol }: { symbol: string }) => {
      return `${symbol.toLowerCase()}@trade`
    },

    /**
     * Kline/Candlestick Streams<br>
     *
     * The Kline/Candlestick Stream push updates to the current klines/candlestick every second.<br>
     *
     * Stream Name: &lt;symbol&gt;@kline_&lt;interval&gt; <br>
     * Update Speed: 2000ms <br>
     *
     * {@link https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-streams}
     *
     * @param {string} symbol
     * @param {string} interval - m -> minutes; h -> hours; d -> days; w -> weeks; M -> months:<br>
     *     1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
     */
    kline: (opts: { symbol: string; interval: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' }) => {
      return `${opts.symbol.toLowerCase()}@kline_${opts.interval}`
    },

    /**
     * Individual symbol or all symbols book ticker<br>
     *
     * Pushes any update to the best bid or ask's price or quantity in real-time.<br>
     *
     * Stream Name: &lt;symbol&gt;@bookTicker or !bookTicker <br>
     * Update Speed: Real-time<br>
     *
     * {@link https://binance-docs.github.io/apidocs/spot/en/#individual-symbol-book-ticker-streams}
     * <br>
     * {@link https://binance-docs.github.io/apidocs/spot/en/#all-book-tickers-stream}
     *
     * @param {string} [symbol]
     */
    bookTicker: ({ symbol }: { symbol: string }) => {
      return `${symbol.toLowerCase()}@bookTicker`
    },

    /**
     * Partial Book Depth Streams<br>
     *
     * Top bids and asks, Valid are 5, 10, or 20.<br>
     *
     * Stream Names: &lt;symbol&gt;@depth&lt;levels&gt; or &lt;symbol&gt;@depth&lt;levels&gt;@100ms. <br>
     * Update Speed: 1000ms or 100ms<br>
     *
     * {@link https://binance-docs.github.io/apidocs/spot/en/#partial-book-depth-streams}
     *
     * @param {string} symbol
     * @param {string} levels - 5, 10, or 20
     * @param {string} speed - 1000ms or 100ms
     *
     */
    partialBookDepth: (opts: { symbol: string; levels: 5 | 10 | 20; speed: 100 | 250 | 500 }) => {
      return `${opts.symbol.toLowerCase()}@depth${opts.levels}@${opts.speed}ms`
    },

    /**
     * Diff. Depth Stream<br>
     *
     * Order book price and quantity depth updates used to locally manage an order book.<br>
     *
     * Stream Names: &lt;symbol&gt;@depth or &lt;symbol&gt;@depth@100ms <br>
     * Update Speed: 1000ms or 100ms<br>
     *
     * {@link https://binance-docs.github.io/apidocs/spot/en/#diff-depth-stream}
     *
     * @param {string} symbol
     * @param {string} speed - 1000ms or 100ms
     *
     */
    diffBookDepth: ({ symbol, speed }: { symbol: string; speed: 100 | 1000 }) => {
      return `${symbol.toLowerCase()}@depth@${speed}ms`
    }
  },
  getSubscriptions: (streams) => {
    return streams
  },
  getStreamInfo: (stream) => {
    if (stream.endsWith('@aggTrade')) {
      return {
        subscription: 'aggTrade',
        params: { symbol: stream.split('@aggTrade')[0].toUpperCase() }
      }
    }

    if (stream.endsWith('@trade')) {
      return {
        subscription: 'trade',
        params: { symbol: stream.split('@trade')[0].toUpperCase() }
      }
    }

    if (stream.includes('@kline_')) {
      const [symbol, interval] = stream.split('@kline_')

      return {
        subscription: 'kline',
        params: { symbol: symbol.toUpperCase(), interval: interval as '1m' }
      }
    }

    if (stream.endsWith('@bookTicker')) {
      return {
        subscription: 'bookTicker',
        params: { symbol: stream.split('@bookTicker')[0].toUpperCase() }
      }
    }

    if (stream.includes('@depth@')) {
      const [symbol, ms] = stream.split('@depth@')
      const speed = +ms.split('ms')[0] as 100 | 1000

      if (speed !== 1000 && speed !== 100) {
        throw `Invalid:${stream}`
      }

      return {
        subscription: 'diffBookDepth',
        params: { symbol: symbol.toUpperCase(), speed }
      }
    }

    if (stream.includes('@depth')) {
      const [symbol, rest] = stream.split('@depth')
      const [lvl, ms] = rest.split('@')

      const speed = +ms.split('ms')[0] as 100 | 250 | 500
      const levels = +lvl as 5 | 10 | 20

      if (speed !== 100 && speed !== 250 && speed !== 500) {
        throw `Invalid:${stream}`
      }

      if (levels !== 5 && levels !== 10 && levels !== 20) {
        throw `Invalid:${stream}`
      }

      return {
        subscription: 'partialBookDepth',
        params: { symbol: symbol.toUpperCase(), speed, levels }
      }
    }

    throw `invalid binance stream:${stream}`
  }
})

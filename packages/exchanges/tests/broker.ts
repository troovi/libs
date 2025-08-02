import {
  Broker,
  createBinanceExchange,
  createBitgetExchange,
  createBitmartExchange,
  createByBitExchange,
  createCoinExExchange,
  createGateExchange,
  createKuCoinExchange,
  createMexcExchange,
  createOKXExchange,
  createOrangeXExchange
} from '../src'

export const broker = new Broker([
  createBinanceExchange({
    apiKey: 'M8aYKZB5Yre9aKI3dILvcNL60yinWRVAxBk320iB9pwmDeITWdkI76g5sDaKBSQ3',
    apiSecret: 'cn6MdRARQydWRR8WRLzFS5FCpIbyd3DQ3AvooPkbW11mVbl08sATp2S9vU16lO2e'
  }),
  createBitgetExchange({
    apiKey: 'bg_d06006103021cbaf43d9ff93b5ac650f',
    apiSecret: '95ee2d329b638448db1648c0d44be8221ba81fbe4afe52380e1a4834b8f41d7a',
    passPhrase: 'Nir892nUe80hOf28'
  }),
  createBitmartExchange({
    apiKey: '955773a2026c060a5335f2f65d5a992bcc32b730',
    apiSecret: '4311706db3f24f0f4f885a0e44c0499dc5cf19f1757bf56e53c2ed7482d457da'
  }),
  createByBitExchange({
    apiKey: '0vuO1baak6kuf6ZWk1',
    apiSecret: 'tFiKlxoSY5jWVY9AN4EOsYxQyxBVIELWEmAt'
  }),
  createCoinExExchange({
    apiKey: 'F7CB75171C174764923E91E76DE7BBC9',
    apiSecret: '0DB22EC48686C759B6A6EEF13AB0EAFD2835090F02765688'
  }),
  createGateExchange({
    apiKey: '10951afe0e63f036c44b2c0183a4999d',
    apiSecret: 'bdec0068f79568fa7491673b97c6d9eccf389beb43b150cab559450be3cf9c6c'
  }),
  createKuCoinExchange({
    apiKey: '68453d2d965ac1000180e709',
    apiSecret: '1c5a0092-2760-4b59-9c83-9e34d64432f7',
    apiPassword: 's8zT3Zyy4YbjJAg'
  }),
  createMexcExchange({
    apiKey: 'mx0vglUA9lvLzUK3Op',
    apiSecret: '8056a89f181b43d79bfefe21eb3c7c53'
  }),
  createOKXExchange({
    apiKey: '747affab-d10b-4f25-ac34-97c98be5b3be',
    apiSecret: 'A3DD6CC520895717411EF9F28CE2F0E0',
    passPhrase: 'fR2JyA8RqSCQ9ce&'
  }),
  createOrangeXExchange({
    apiKey: '',
    apiSecret: ''
  })
])

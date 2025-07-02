import { CandlestickSeries, createChart } from 'lightweight-charts'
import { generateAlternativeCandleData } from './data'
import { useEffect, useRef } from 'react'

export const App = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      const chart = createChart(ref.current, {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight
      })

      const series = chart.addSeries(CandlestickSeries)

      series.setData(generateAlternativeCandleData())
    }
  }, [])

  return <div style={{ height: '100vh', width: '100%' }} ref={ref} />
}

export class InspectPerfomance {
  private moment: number = 0
  private memory: number = 0

  constructor(private readonly name: string) {}

  start() {
    this.moment = performance.now()
    this.memory = process.memoryUsage().heapUsed
  }

  done() {
    const time = performance.now() - this.moment
    const memoryCost = process.memoryUsage().heapUsed - this.memory

    console.log(`${this.name}: Memory increase: ${memoryCost / 1024} KB`)
    console.log(`${this.name}: Execution time: ${time} ms`)

    return {
      memory: `${memoryCost / 1024} KB`,
      time: `${time} ms`
    }
  }
}

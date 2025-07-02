interface Subject {
  resolve: (value: any) => void
  reject: (reason?: any) => void
  target: () => Promise<any>
}

export class QueueManager {
  private active: boolean = false
  private queue: Subject[] = []

  add<T>(target: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ resolve, reject, target })
      this.run()
    })
  }

  private async run() {
    if (!this.active) {
      this.active = true
      await this.next()
      this.active = false
    }
  }

  private async next() {
    const subject = this.queue[0]

    if (subject) {
      await subject
        .target()
        .then((data) => subject.resolve(data))
        .catch((e) => subject.reject(e))
        .finally(() => this.queue.shift())

      await this.next()
    }
  }
}

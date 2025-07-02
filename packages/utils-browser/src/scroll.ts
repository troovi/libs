interface Speed {
  effect: 'speed'
  speed: number // px per second
}

interface Duration {
  effect: 'duration'
  duration: number // animation time in millisecond
}

export class ScrollAnimation {
  private animationID = null as null | number
  private animationTarget = null as null | number

  constructor(public ref: React.RefObject<HTMLDivElement>) {}

  getPosition() {
    if (this.ref.current) {
      return {
        scrollTop: this.ref.current.scrollTop,
        clientHeight: this.ref.current.clientHeight
      }
    }
  }

  moveTo(value: number, effect: Speed | Duration, cb: () => void = () => {}) {
    const scrollable = this.ref.current

    if (scrollable) {
      this.execute(scrollable, value, effect, cb)
    }
  }

  moveToCenter(value: number, effect: Speed | Duration, cb: () => void = () => {}) {
    const scrollable = this.ref.current

    if (scrollable) {
      this.execute(scrollable, value - scrollable.clientHeight / 2, effect, cb)
    }
  }

  isAnimating() {
    return this.animationID !== null
  }

  cancelAnimation() {
    if (this.animationID) {
      cancelAnimationFrame(this.animationID)
      this.animationID = null
    }
  }

  private execute(scrollable: HTMLDivElement, moveTo: number, data: Speed | Duration, cb: () => void) {
    if (this.animationID) {
      this.cancelAnimation()

      if (scrollable && this.animationTarget) {
        scrollable.scrollTo({ top: this.animationTarget })
        this.animationTarget = null
      }
    }

    if (data.effect === 'speed') {
      this.createSpeedAnimation(scrollable, moveTo, data.speed, cb)
    }

    if (data.effect === 'duration') {
      this.createDurationAnimation(scrollable, moveTo, data.duration, cb)
    }
  }

  private createSpeedAnimation(
    scrollable: HTMLDivElement,
    moveTo: number,
    speed: number,
    cb: () => void
  ) {
    if (scrollable.scrollTop !== moveTo && speed !== 0) {
      const startPosition = scrollable.scrollTop
      const distance = moveTo - startPosition
      const direction = Math.sign(distance)
      const absDistance = Math.abs(distance)
      const startTime = performance.now()

      const animation = (currentTime: number) => {
        const elapsed = (currentTime - startTime) / 1000
        const moved = Math.min(elapsed * speed, absDistance)

        scrollable.scrollTo({ top: startPosition + direction * moved })

        if (moved < absDistance) {
          this.animationID = requestAnimationFrame(animation)
        } else {
          this.animationID = null
          this.animationTarget = null
          cb()
        }
      }

      this.animationID = requestAnimationFrame(animation)
      this.animationTarget = moveTo
    }
  }

  private createDurationAnimation(
    scrollable: HTMLDivElement,
    moveTo: number,
    duration: number,
    cb: () => void
  ) {
    if (scrollable.scrollTop !== moveTo && duration !== 0) {
      const startPosition = scrollable.scrollTop
      const distance = moveTo - startPosition
      const startTime = performance.now()

      const animation = (currentTime: number) => {
        const elapsedTime = currentTime - startTime
        const progress = Math.min(elapsedTime / duration, 1)

        const ease = progress

        scrollable.scrollTo({ top: startPosition + distance * ease })

        if (progress < 1) {
          this.animationID = requestAnimationFrame(animation)
        } else {
          this.animationID = null
          this.animationTarget = null
          cb()
        }
      }

      this.animationID = requestAnimationFrame(animation)
      this.animationTarget = moveTo
    }
  }
}

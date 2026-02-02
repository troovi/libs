const throttle = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
  trailing: boolean
) => {
  let isThrottled = false
  let lastArgs: Args | null = null
  let timeoutId: number | null = null

  const throttled = (...args: Args) => {
    if (isThrottled) {
      lastArgs = args
    } else {
      isThrottled = true

      if (trailing) {
        lastArgs = args
      } else {
        fn(...args)
      }

      timeoutId = window.setTimeout(() => {
        isThrottled = false

        if (lastArgs) {
          fn(...lastArgs)
          lastArgs = null
        }
      }, delay)
    }
  }

  throttled.cancel = () => {
    isThrottled = false

    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return throttled
}

export { throttle }

export const getError = (exec: () => void) => {
  try {
    exec()
  } catch (error) {
    if (error && typeof error === 'string') {
      return {
        error: true,
        messages: [error as string]
      }
    }

    if (error instanceof Array && error.every((e) => e && typeof e === 'string')) {
      return {
        error: true,
        messages: error as string[]
      }
    }

    return {
      error: true
    }
  }
}

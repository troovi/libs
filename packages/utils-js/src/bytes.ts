export const formatBytes = (bytes: number) => {
  const KB = bytes / 1024

  if (KB > 1024) {
    return +(KB / 1024).toFixed(1) + ' MB'
  }

  if (KB < 1) {
    return bytes + ' B'
  }

  return Math.trunc(+KB.toFixed(2)) + ' KB'
}

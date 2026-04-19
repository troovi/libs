export const Download = async (blob: Blob, filename: string) => {
  const a = document.createElement('a')
  const href = URL.createObjectURL(blob)

  a.href = href
  a.setAttribute('download', filename)
  a.click()

  // cleanup
  URL.revokeObjectURL(href)
}

export const generatePreview = (file: File) => {
  const url = URL.createObjectURL(file)

  return {
    url,
    cleanup: () => {
      URL.revokeObjectURL(url)
    }
  }
}

export const getFiles = (files: FileList) => {
  return Array.from(files)
}

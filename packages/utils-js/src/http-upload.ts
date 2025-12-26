export const transport = (file: Blob) => {
  const data = new FormData()

  data.append('file', file)
  data.append('type', 'file')

  return data
}

export const generatePreview = (file: File) => {
  const url = URL.createObjectURL(file)

  return {
    url,
    destroy: () => {
      URL.revokeObjectURL(url)
    }
  }
}

export const getFiles = (files: FileList) => {
  return Array.from(files)
}

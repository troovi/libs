import { existsSync, writeFileSync } from 'fs'
import { getFileData } from './fs'

export class FileDriver<T> {
  private file: T

  constructor(private path: string, defaultValue: T) {
    if (!existsSync(path)) {
      writeFileSync(path, JSON.stringify(defaultValue))
    }

    this.file = getFileData<T>(path)
  }

  getData() {
    return this.file
  }

  change(mutate: (value: T) => void) {
    mutate(this.file)
    writeFileSync(this.path, JSON.stringify(this.file))
  }
}

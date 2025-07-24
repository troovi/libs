import { existsSync, writeFileSync } from 'fs'
import { getFileData } from './fs'

interface CacheOptions<T> {
  cacheDir?: string
  source: string
  rotation?: number
  fetchData: () => Promise<T>
}

export class LocalCache<T> {
  private path: string
  private rotation: number | null
  private fetchData: () => Promise<T>

  constructor({ source, cacheDir = 'caches', rotation, fetchData }: CacheOptions<T>) {
    this.path = `${cacheDir}/${source}`
    this.rotation = rotation ?? null
    this.fetchData = fetchData
  }

  async get() {
    const cache = this.getCache()

    if (cache) {
      return cache
    }

    return this.resetCache()
  }

  getCache() {
    if (existsSync(this.path)) {
      const cache = getFileData<{ timestamp: number; data: T }>(this.path)

      if (cache) {
        if (this.rotation && Date.now() > cache.timestamp + this.rotation) {
          return null
        }

        return cache.data
      }
    }
  }

  async resetCache() {
    const data = await this.fetchData()

    this.setCache(data)

    return data
  }

  private setCache(data: T) {
    writeFileSync(this.path, JSON.stringify({ timestamp: Date.now(), data }))
  }
}

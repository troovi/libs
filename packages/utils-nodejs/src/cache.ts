import { existsSync, writeFileSync } from 'fs'
import { getFileData } from './fs'
import { CommonRequest } from './common-request'

interface CacheOptions<T> {
  cacheDir?: string
  source: string
  rotation?: number
  fetchData: () => Promise<T>
}

export interface CacheFile<T> {
  timestamp: number
  data: T
}

export class LocalCache<T> {
  private path: string
  private rotation: number | null
  private fetchData: () => Promise<T>
  private getData = CommonRequest<T>(() => this.fetchData())

  constructor({ source, cacheDir = 'caches', rotation, fetchData }: CacheOptions<T>) {
    this.path = `${cacheDir}/${source}`
    this.rotation = rotation ?? null
    this.fetchData = fetchData
  }

  async get() {
    const value = this.getCacheValue()

    if (value) {
      return value
    }

    return this.reset()
  }

  getCacheValue() {
    if (existsSync(this.path)) {
      const cache = getFileData<CacheFile<T>>(this.path)

      if (cache) {
        if (this.rotation && Date.now() > cache.timestamp + this.rotation) {
          return null
        }

        return cache
      }
    }

    return null
  }

  async reset() {
    return this.getData().then((data) => {
      const cache: CacheFile<T> = {
        timestamp: Date.now(),
        data
      }

      writeFileSync(this.path, JSON.stringify(cache))

      return cache
    })
  }
}

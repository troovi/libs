import { existsSync, writeFileSync } from 'fs'
import { getFileData } from './fs'
import { EventBroadcaster } from '@troovi/utils-js'

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
  private isFetching: boolean = false
  private requests = new EventBroadcaster<T>()

  constructor({ source, cacheDir = 'caches', rotation, fetchData }: CacheOptions<T>) {
    this.path = `${cacheDir}/${source}`
    this.rotation = rotation ?? null
    this.fetchData = fetchData
  }

  private getData(): Promise<T> {
    if (!this.isFetching) {
      this.isFetching = true

      return this.fetchData().then((value) => {
        this.isFetching = false
        this.requests.emit(value)

        return value
      })
    }

    return new Promise<T>((resolve) => {
      const unsubscribe = this.requests.subscribe((value) => {
        unsubscribe()
        resolve(value)
      })
    })
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
      const cache = getFileData<CacheFile<T>>(this.path)

      if (cache) {
        if (this.rotation && Date.now() > cache.timestamp + this.rotation) {
          return null
        }

        return cache
      }
    }
  }

  async resetCache() {
    return this.getData().then((data) => {
      return this.setCache(data)
    })
  }

  private setCache(data: T) {
    const cache: CacheFile<T> = {
      timestamp: Date.now(),
      data
    }

    writeFileSync(this.path, JSON.stringify(cache))

    return cache
  }
}

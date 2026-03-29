import { CollectionScheme, DataScheme, DataSource } from '@companix/xeo-scheme'
import { Connection } from 'mongoose'
import { createMongoDriver } from '../drivers/collection.driver'
import { DATA_SOURCE_TOKEN } from '../constants'

class DataSourceStorageService {
  private dataSource: DataSource<CollectionScheme> | null = null
  private dataScheme: DataScheme<CollectionScheme> | null = null

  getProviderToken(dataScheme: DataScheme<CollectionScheme>) {
    if (this.dataScheme === null) {
      this.dataScheme = dataScheme
    }

    if (this.dataScheme !== dataScheme) {
      throw new Error(`[MongoDriver] driver cannot work with several dataSchemes`)
    }

    return DATA_SOURCE_TOKEN
  }

  getSource(dataScheme: DataScheme<CollectionScheme>, connection: Connection) {
    if (this.dataScheme !== dataScheme) {
      throw new Error(`[MongoDriver] driver cannot work with several dataSchemes`)
    }

    if (!this.dataSource) {
      this.dataSource = new DataSource(dataScheme, {
        createDriver: createMongoDriver(connection)
      })
    }

    return this.dataSource
  }
}

export const DataSourceStorage = new DataSourceStorageService()

import { Provider } from '@nestjs/common'
import { DynamicModule, Module } from '@nestjs/common'
import { getConnectionToken, getDataSourceToken } from './common/tokens'
import { Connection } from 'mongoose'
import { CollectionScheme, DataScheme, DataSource } from '@companix/xeo-scheme'
import { MongooseCoreModule } from './mongoose.module'
import { MongooseModuleOptions } from './mongoose-options.interface'
import { DataSourceStorage } from './storages/data-source'
import { MongoDriverOptions } from './drivers/collection.driver'

interface RootOptions {
  uri: string
  dataScheme: DataScheme<CollectionScheme>
  driverOptions?: Omit<MongoDriverOptions, 'connection'>
  mongoOptions?: MongooseModuleOptions
}

/**
 * @publicApi
 */
@Module({})
export class MongooseDriverModule {
  static forRoot(options: RootOptions): DynamicModule {
    const { uri, dataScheme, mongoOptions = {}, driverOptions = {} } = options

    const provider: Provider = {
      provide: getDataSourceToken(dataScheme),
      useFactory: (connection: Connection): DataSource<CollectionScheme> => {
        return DataSourceStorage.getSource(dataScheme, { connection, ...driverOptions })
      },
      inject: [getConnectionToken(mongoOptions.connectionName)]
    }

    return {
      global: true,
      module: MongooseDriverModule,
      imports: [MongooseCoreModule.forRoot(uri, mongoOptions)],
      providers: [provider],
      exports: [provider]
    }
  }

  // static forFeature(dataSource: DataScheme<CollectionScheme>, connectionName?: string): DynamicModule {
  //   const provider: Provider = {
  //     provide: getDataSourceToken(dataSource),
  //     useFactory: (connection: Connection): DataSource<CollectionScheme> => {
  //       return DataSourceStorage.getSource(dataSource, connection)
  //     },
  //     inject: [getConnectionToken(connectionName)]
  //   }

  //   return {
  //     module: MongooseDriverModule,
  //     providers: [provider],
  //     exports: [provider]
  //   }
  // }
}

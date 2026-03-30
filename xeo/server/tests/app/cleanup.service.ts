import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource, MongoCollectionDriver } from '../../lib'
import { AppScheme, dataScheme } from '@companix/xeo-devkit'
import { DataSource } from '@companix/xeo-scheme'

@Injectable()
export class ClenupService {
  constructor(
    @InjectDataSource(dataScheme)
    dataSource: DataSource<AppScheme, MongoCollectionDriver<AppScheme>>
  ) {
    Logger.log('Initialize', 'ClenupService')

    dataSource.driver.subscribeCleanup('bankCard', (data) => {
      console.log(data)
    })
  }
}

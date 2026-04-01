import { Module } from '@nestjs/common'
import { AppModule } from './module/app.module'
import { MongooseDriverModule } from '../../lib'
import { getMongoConnectionOptions, getMongoConnectionURL } from './db'
import { dataScheme } from '@companix/xeo-devkit'

@Module({
  imports: [
    MongooseDriverModule.forRoot({
      uri: getMongoConnectionURL(),
      dataScheme,
      mongoOptions: getMongoConnectionOptions()
    }),
    AppModule //
  ]
})
export class RootModule {}

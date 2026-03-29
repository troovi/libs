import { Module } from '@nestjs/common'
import { AppModule } from './module/app.module'
import { MongooseDriverModule } from '../../lib'
import { getMongoConnectionOptions, getMongoConnectionURL } from './db'

@Module({
  imports: [
    MongooseDriverModule.forRoot(getMongoConnectionURL(), getMongoConnectionOptions()),
    AppModule //
  ]
})
export class RootModule {}

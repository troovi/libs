import { Module } from '@nestjs/common'
import { MongooseDriverModule } from '../../../lib'
import { AppService } from './app.service'
import { AppController } from './app.controller'
import { dataScheme } from '@companix/xeo-devkit'

@Module({
  imports: [MongooseDriverModule.forFeature(dataScheme)],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

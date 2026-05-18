import { Module } from '@nestjs/common'

import { MeService } from './me.service'

@Module({
  providers: [MeService],
  exports: [MeService]
})
export class MeModule {}

import { Module } from '@nestjs/common'

import { SbpBanksService } from './sbp-banks.service'

@Module({
  providers: [SbpBanksService],
  exports: [SbpBanksService]
})
export class SbpBanksModule {}

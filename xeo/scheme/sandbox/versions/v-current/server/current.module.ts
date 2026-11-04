import { Module } from '@nestjs/common'
import { CurrentController } from './current.controller'
import { JournalService } from './journal.service'

@Module({
  controllers: [CurrentController],
  providers: [JournalService]
})
export class CurrentModule {}

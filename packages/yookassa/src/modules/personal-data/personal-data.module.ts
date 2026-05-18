import { Module } from '@nestjs/common'

import { PersonalDataService } from './personal-data.service'

@Module({
  providers: [PersonalDataService],
  exports: [PersonalDataService]
})
export class PersonalDataModule {}

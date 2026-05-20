import { Module } from '@nestjs/common';
import { CentersController } from './centers.controller.js';
import { CentersService } from './centers.service.js';

@Module({
  controllers: [CentersController],
  providers: [CentersService],
})
export class CentersModule {}

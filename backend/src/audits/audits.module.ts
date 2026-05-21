import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '../admin/admin.module.js';
import { AuditsController } from './audits.controller.js';
import { AuditsService } from './audits.service.js';

@Module({
  imports: [AdminModule, ConfigModule],
  controllers: [AuditsController],
  providers: [AuditsService],
})
export class AuditsModule {}

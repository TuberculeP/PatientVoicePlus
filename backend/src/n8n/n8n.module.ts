import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { N8nController } from './n8n.controller.js';
import { N8nService } from './n8n.service.js';

@Module({
  imports: [ConfigModule],
  controllers: [N8nController],
  providers: [N8nService],
})
export class N8nModule {}

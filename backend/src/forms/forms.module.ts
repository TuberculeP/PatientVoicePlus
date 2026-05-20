import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FormsController } from './forms.controller.js';
import { FormsService } from './forms.service.js';

@Module({
  imports: [ConfigModule],
  controllers: [FormsController],
  providers: [FormsService],
})
export class FormsModule {}

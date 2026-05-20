import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { AnalysisCallbackDto } from './dto/analysis-callback.dto.js';
import { N8nService } from './n8n.service.js';

@SkipThrottle()
@Controller('n8n')
export class N8nController {
  constructor(
    private readonly n8nService: N8nService,
    private readonly config: ConfigService,
  ) {}

  @Post('analysis')
  handleAnalysis(
    @Headers('x-n8n-secret') secret: string,
    @Body() dto: AnalysisCallbackDto,
  ) {
    const expected = this.config.get<string>('N8N_CALLBACK_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException();
    }
    return this.n8nService.handleCallback(dto);
  }
}

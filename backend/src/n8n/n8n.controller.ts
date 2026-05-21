import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { AnalysisCallbackDto } from './dto/analysis-callback.dto.js';
import { CreateAuditDraftDto } from './dto/create-audit-draft.dto.js';
import { ReviewsQueryDto } from './dto/reviews-query.dto.js';
import { N8nService } from './n8n.service.js';

@SkipThrottle()
@Controller('n8n')
export class N8nController {
  constructor(
    private readonly n8nService: N8nService,
    private readonly config: ConfigService,
  ) {}

  private checkSecret(secret: string) {
    const expected = this.config.get<string>('N8N_CALLBACK_SECRET');
    if (!expected || secret !== expected) throw new UnauthorizedException();
  }

  @Post('analysis')
  handleAnalysis(
    @Headers('x-n8n-secret') secret: string,
    @Body() dto: AnalysisCallbackDto,
  ) {
    this.checkSecret(secret);
    return this.n8nService.handleCallback(dto);
  }

  @Get('reviews')
  fetchReviews(
    @Headers('x-n8n-secret') secret: string,
    @Query() dto: ReviewsQueryDto,
  ) {
    this.checkSecret(secret);
    return this.n8nService.fetchReviews(dto);
  }

  @Post('audit-draft')
  createAuditDraft(
    @Headers('x-n8n-secret') secret: string,
    @Body() dto: CreateAuditDraftDto,
  ) {
    this.checkSecret(secret);
    return this.n8nService.createAuditDraft(dto);
  }
}

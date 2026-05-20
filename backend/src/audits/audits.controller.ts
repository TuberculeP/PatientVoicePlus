import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard.js';
import { AuditsService } from './audits.service.js';
import { GenerateAuditDto } from './dto/generate-audit.dto.js';
import { UpdateAuditDto } from './dto/update-audit.dto.js';

@Controller('admin/audits')
@UseGuards(AdminGuard)
export class AuditsController {
  constructor(private readonly audits: AuditsService) {}

  @Get()
  list() {
    return this.audits.list();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.audits.findOne(id);
  }

  @Post('generate')
  generate(@Body() dto: GenerateAuditDto) {
    return this.audits.generate(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAuditDto) {
    return this.audits.update(id, dto);
  }
}

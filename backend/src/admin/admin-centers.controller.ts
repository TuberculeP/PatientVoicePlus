import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminCentersService } from './admin-centers.service.js';
import { AdminGuard } from './admin.guard.js';
import { CreateCenterDto } from './dto/create-center.dto.js';
import { UpdateCenterDto } from './dto/update-center.dto.js';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminCentersController {
  constructor(private readonly centers: AdminCentersService) {}

  @Get('specialties')
  listSpecialties() {
    return this.centers.findAllSpecialties();
  }

  @Get('centers')
  listCenters() {
    return this.centers.findAll();
  }

  @Get('centers/:id')
  getCenter(@Param('id', ParseUUIDPipe) id: string) {
    return this.centers.findOne(id);
  }

  @Post('centers')
  createCenter(@Body() dto: CreateCenterDto) {
    return this.centers.create(dto);
  }

  @Patch('centers/:id')
  updateCenter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCenterDto,
  ) {
    return this.centers.update(id, dto);
  }

  @Patch('centers/:id/deactivate')
  deactivateCenter(@Param('id', ParseUUIDPipe) id: string) {
    return this.centers.deactivate(id);
  }

  @Patch('centers/:id/activate')
  activateCenter(@Param('id', ParseUUIDPipe) id: string) {
    return this.centers.activate(id);
  }

  @Delete('centers/:id')
  removeCenter(@Param('id', ParseUUIDPipe) id: string) {
    return this.centers.remove(id);
  }
}

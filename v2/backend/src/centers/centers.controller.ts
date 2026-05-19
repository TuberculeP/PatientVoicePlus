import { Controller, Get, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common'
import { CentersService } from './centers.service.js'

@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Get()
  findAll() {
    return this.centersService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const center = await this.centersService.findOne(id)
    if (!center) throw new NotFoundException('Center not found')
    return center
  }
}

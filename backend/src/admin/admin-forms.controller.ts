import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminFormsService } from './admin-forms.service.js';
import { AdminGuard } from './admin.guard.js';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminFormsController {
  constructor(private readonly forms: AdminFormsService) {}

  @Get('forms')
  listForms(@Query('centerId') centerId?: string) {
    return this.forms.findAll(centerId);
  }

  @Get('forms/:id')
  getForm(@Param('id', ParseUUIDPipe) id: string) {
    return this.forms.findOne(id);
  }

  @Patch('forms/:id/deactivate')
  deactivateForm(@Param('id', ParseUUIDPipe) id: string) {
    return this.forms.deactivate(id);
  }

  @Patch('forms/:id/activate')
  activateForm(@Param('id', ParseUUIDPipe) id: string) {
    return this.forms.activate(id);
  }
}

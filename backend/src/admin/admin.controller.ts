import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.admin.login(dto.username, dto.password);
  }

  @Get('me')
  @UseGuards(AdminGuard)
  me() {
    return { ok: true };
  }
}

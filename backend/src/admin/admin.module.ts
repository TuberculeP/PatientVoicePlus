import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminCentersController } from './admin-centers.controller.js';
import { AdminCentersService } from './admin-centers.service.js';
import { AdminFormsController } from './admin-forms.controller.js';
import { AdminFormsService } from './admin-forms.service.js';
import { AdminController } from './admin.controller.js';
import { AdminGuard } from './admin.guard.js';
import { AdminService } from './admin.service.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('ADMIN_TOKEN_SECRET'),
        signOptions: {
          expiresIn: config.get<number>('ADMIN_TOKEN_TTL_SECONDS', 43200),
          subject: 'admin',
        },
      }),
    }),
  ],
  controllers: [AdminController, AdminCentersController, AdminFormsController],
  providers: [AdminService, AdminCentersService, AdminFormsService, AdminGuard],
  exports: [AdminService, AdminGuard, AdminCentersService, AdminFormsService],
})
export class AdminModule {}

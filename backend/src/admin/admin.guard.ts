import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly admin: AdminService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request & { headers: any }>();
    const header = req.headers?.authorization as string | undefined;
    if (!header?.startsWith('Bearer '))
      throw new UnauthorizedException('Non authentifié');
    const token = header.slice('Bearer '.length).trim();
    this.admin.verifyToken(token);
    return true;
  }
}

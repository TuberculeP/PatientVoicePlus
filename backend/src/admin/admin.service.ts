import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

type TokenPayload = {
  sub: string;
};

@Injectable()
export class AdminService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  private getUsername() {
    return this.config.get<string>('ADMIN_USERNAME', 'admin');
  }

  private getPassword() {
    return this.config.get<string>('ADMIN_PASSWORD');
  }

  login(username: string, password: string) {
    const expectedUser = this.getUsername();
    const expectedPass = this.getPassword();
    if (!expectedPass) throw new Error('ADMIN_PASSWORD is missing');

    if (username !== expectedUser || password !== expectedPass) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return { token: this.jwt.sign({}) };
  }

  verifyToken(token: string): TokenPayload {
    try {
      return this.jwt.verify<TokenPayload>(token, { subject: 'admin' });
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }
}

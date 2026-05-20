import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

type TokenPayload = {
  sub: 'admin';
  iat: number;
  exp: number;
};

function base64UrlEncode(buf: Buffer) {
  return buf
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function base64UrlDecodeToBuffer(s: string) {
  const normalized = s.replaceAll('-', '+').replaceAll('_', '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

function timingSafeEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

@Injectable()
export class AdminService {
  constructor(private readonly config: ConfigService) {}

  private getUsername() {
    return this.config.get<string>('ADMIN_USERNAME', 'admin');
  }

  private getPassword() {
    return this.config.get<string>('ADMIN_PASSWORD');
  }

  private getSecret() {
    const secret = this.config.get<string>('ADMIN_TOKEN_SECRET');
    if (!secret) throw new Error('ADMIN_TOKEN_SECRET is missing');
    return secret;
  }

  private getTtlSeconds() {
    return this.config.get<number>('ADMIN_TOKEN_TTL_SECONDS', 60 * 60 * 12);
  }

  login(username: string, password: string) {
    const expectedUser = this.getUsername();
    const expectedPass = this.getPassword();
    if (!expectedPass) throw new Error('ADMIN_PASSWORD is missing');

    if (username !== expectedUser || password !== expectedPass) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return { token: this.signToken() };
  }

  signToken() {
    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
      sub: 'admin',
      iat: now,
      exp: now + this.getTtlSeconds(),
    };

    const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload), 'utf8'));
    const sig = crypto.createHmac('sha256', this.getSecret()).update(payloadB64).digest();
    const sigB64 = base64UrlEncode(sig);
    return `${payloadB64}.${sigB64}`;
  }

  verifyToken(token: string): TokenPayload {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) throw new UnauthorizedException('Token invalide');

    const expectedSig = crypto
      .createHmac('sha256', this.getSecret())
      .update(payloadB64)
      .digest();
    const actualSig = base64UrlDecodeToBuffer(sigB64);
    if (!timingSafeEqual(expectedSig, actualSig)) {
      throw new UnauthorizedException('Token invalide');
    }

    let payload: TokenPayload;
    try {
      payload = JSON.parse(base64UrlDecodeToBuffer(payloadB64).toString('utf8')) as TokenPayload;
    } catch {
      throw new UnauthorizedException('Token invalide');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.sub !== 'admin' || typeof payload.exp !== 'number' || payload.exp <= now) {
      throw new UnauthorizedException('Token expiré');
    }

    return payload;
  }
}


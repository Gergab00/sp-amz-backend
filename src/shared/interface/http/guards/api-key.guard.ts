import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

const API_KEY_HEADER = 'x-api-key';
const PUBLIC_PATH_PREFIXES = ['/api/docs', '/api/scalar', '/api/docs-json'];

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    if (this.isPublicPath(request.path)) {
      return true;
    }

    const configuredApiKey = this.configService.get<string>('API_KEY');

    if (!configuredApiKey) {
      throw new InternalServerErrorException(
        'API_KEY no configurada en el entorno',
      );
    }

    const providedApiKey = this.getApiKeyFromHeaders(request);

    if (!providedApiKey || providedApiKey !== configuredApiKey) {
      throw new UnauthorizedException('API key invalida o ausente');
    }

    return true;
  }

  private isPublicPath(path: string): boolean {
    return PUBLIC_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
  }

  private getApiKeyFromHeaders(request: Request): string | null {
    const headerValue = request.headers[API_KEY_HEADER];

    if (Array.isArray(headerValue)) {
      return headerValue[0] ?? null;
    }

    if (typeof headerValue === 'string') {
      return headerValue;
    }

    return null;
  }
}

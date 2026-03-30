import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';

type MockRequest = {
  path: string;
  headers: Record<string, string | string[] | undefined>;
};

function createExecutionContext(request: MockRequest): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
  } as unknown as ExecutionContext;
}

describe('ApiKeyGuard', () => {
  let configService: { get: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: ApiKeyGuard;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    };

    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };

    guard = new ApiKeyGuard(
      configService as unknown as ConfigService,
      reflector as unknown as Reflector,
    );
  });

  it('debe permitir rutas marcadas como publicas por metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createExecutionContext({ path: '/api/any', headers: {} });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(configService.get).not.toHaveBeenCalled();
  });

  it('debe permitir rutas de documentacion aunque no tengan metadata publica', () => {
    const context = createExecutionContext({
      path: '/api/docs',
      headers: {},
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(configService.get).not.toHaveBeenCalled();
  });

  it('debe lanzar error 500 si API_KEY no esta configurada', () => {
    configService.get.mockReturnValue(undefined);
    const context = createExecutionContext({
      path: '/api',
      headers: { 'x-api-key': 'abc' },
    });

    expect(() => guard.canActivate(context)).toThrow(
      InternalServerErrorException,
    );
  });

  it('debe lanzar 401 cuando la API key esta ausente', () => {
    configService.get.mockReturnValue('secret-key');
    const context = createExecutionContext({ path: '/api', headers: {} });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('debe lanzar 401 cuando la API key no coincide', () => {
    configService.get.mockReturnValue('secret-key');
    const context = createExecutionContext({
      path: '/api',
      headers: { 'x-api-key': 'otro-valor' },
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('debe permitir acceso cuando la API key coincide', () => {
    configService.get.mockReturnValue('secret-key');
    const context = createExecutionContext({
      path: '/api',
      headers: { 'x-api-key': 'secret-key' },
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});

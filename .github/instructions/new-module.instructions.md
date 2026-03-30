---
applyTo: 'src/modules/**'
---
# Guía de Creación de Módulos de Negocio — sp-amz-backend

## Nomenclatura de carpeta

Cada módulo vive en `src/modules/<nombre>/` en **singular** (excepción: `listings` ya existe en plural; respetar el nombre existente).

## Estructura de archivos (checklist)

```
src/modules/<feature>/
  <feature>.module.ts                                          ← NestJS Module
  domain/
    types/
      <feature>.types.ts                                       ← tipos TS puros (sin decoradores NestJS)
    validators/
      <operation>-<feature>.validator.ts                       ← reglas de negocio (lanza BadRequestException)
    entities/
      <feature>.entity.domain.ts                              ← entidad con lógica de negocio
      <feature>.entity.domain.spec.ts                         ← tests de entidad
  application/
    dto/
      <operation>-<feature>.dto.ts                            ← DTO de entrada con @ApiProperty + class-validator
      <feature>-response.dto.ts                               ← DTO de salida (opcional)
    gateways/
      <feature>-api.port.ts                                   ← interfaz del puerto (token de DI incluido)
      index.ts                                                ← re-export del token
    use-cases/
      <operation>-<feature>.usecase.ts                        ← orquestación, sin lógica de negocio
      <operation>-<feature>.usecase.spec.ts                   ← tests del use-case
      index.ts
    services/
      <feature>.service.ts                                    ← fachada para el controller
  interface/
    http/
      <feature>.controller.ts                                 ← controller delgado con Swagger
      dto/
        <operation>-<feature>.request-dto.interface.ts        ← DTO HTTP (si difiere del application DTO)
  infrastructure/
    adapters/
      spapi.<feature>.gateway.ts                              ← implementación del puerto vía SpapiClient
      index.ts
    mappers/
      <feature>.mapper.infrastructure.ts                      ← mapeo raw SP-API ↔ DTO dominio
      <feature>.mapper.infrastructure.spec.ts                 ← tests del mapper
      index.ts
```

## Reglas de dependencia (obligatorias)

- `domain/` NO importa `@nestjs/*`, ni nada de `infrastructure/` o `interface/`.
- `application/use-cases/` importa SOLO el puerto (interfaz) y tipos de `domain/`. No importa `SpapiClient` ni adapters directamente.
- `infrastructure/adapters/` implementa el puerto e importa `SpapiClient` desde `src/shared/infrastructure/http/spapi/spapi.client.ts`.
- `interface/http/` importa únicamente el servicio de `application/services/`.

## Puerto (port): patrón obligatorio

```ts
// application/gateways/<feature>-api.port.ts
export const FEATURE_API_PORT = Symbol('FeatureApiPort');

export interface FeatureApiPort {
  operationName(input: InputDto): Promise<OutputDto>;
}
```

Registrar en el módulo:
```ts
{
  provide: FEATURE_API_PORT,
  useClass: SpapiFeatureGateway,
}
```

Inyectar en el use-case:
```ts
constructor(
  @Inject(FEATURE_API_PORT) private readonly port: FeatureApiPort,
) {}
```

## Gateway (adapter): patrón obligatorio

```ts
// infrastructure/adapters/spapi.<feature>.gateway.ts
@Injectable()
export class SpapiFeatureGateway implements FeatureApiPort {
  constructor(private readonly spapi: SpapiClient) {}

  async operationName(input: InputDto): Promise<OutputDto> {
    const raw = await this.spapi.callAPI({
      endpoint: 'endpointName',
      operation: 'operationName',
      query: { /* parámetros */ },
    });
    return FeatureMapper.toDto(raw);
  }
}
```

## Mapper: patrón obligatorio

```ts
// infrastructure/mappers/<feature>.mapper.infrastructure.ts
export class FeatureMapper {
  static toDto(raw: Record<string, any>): FeatureResponseDto {
    // mapeo defensivo: usar optional chaining y valores por defecto
    return {
      field: raw?.path?.to?.field ?? defaultValue,
    };
  }
}
```

## Controller: patrón obligatorio

```ts
@ApiTags('Feature')
@Controller('feature')
export class FeatureController {
  constructor(private readonly service: FeatureService) {}

  @Get('path')
  @ApiOperation({ summary: 'Descripción del endpoint' })
  @ApiOkResponse({ description: 'Respuesta exitosa' })
  async operationName(@Query() dto: OperationDto) {
    return this.service.operationName(dto);
  }
}
```

## Registro en AppModule

Después de crear el módulo, **siempre** añadirlo a `src/app.module.ts`:
```ts
import { FeatureModule } from './modules/feature/feature.module';

@Module({
  imports: [
    // ... módulos existentes
    FeatureModule,
  ],
})
export class AppModule {}
```

## Qué actualizar en README.md

Al registrar un módulo nuevo, actualizar estas secciones en `README.md`:
1. **Endpoints Activos Hoy**: añadir los nuevos endpoints con método y ruta.
2. **Endpoints De Negocio Expuestos**: añadir sección del módulo nuevo.
3. **Reglas De Validacion De Negocio Relevantes**: documentar constraints de entrada.
4. **Estructura Del Proyecto**: añadir el módulo a la lista.

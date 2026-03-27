// RUTA: /src/main.ts
// ANCHOR: imports
/**
 * Entrypoint de la aplicación NestJS.
 *
 * Este archivo configura el servidor HTTP, seguridad básica, validaciones
 * globales y la documentación de la API (Swagger). Las responsabilidades son:
 *  - Inicializar el módulo raíz (`AppModule`).
 *  - Aplicar middlewares y pipes globales.
 *  - Exponer la documentación Swagger en `/api/docs`.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { apiReference } from '@scalar/express-api-reference';

// ANCHOR: bootstrap
/**
 * Inicializa y arranca la aplicación NestJS.
 *
 * @remarks
 * - No retorna valor; lanza el servidor HTTP en el puerto indicado por
 *   la variable de entorno PORT o en 5111 por defecto.
 * - Aplica `helmet` para cabeceras de seguridad HTTP estándar y un
 *   `ValidationPipe` global para sanitizar y transformar DTOs entrantes.
 *
 * @async
 */
async function bootstrap() {
  // INFO: Crea la aplicación NestJS a partir del módulo raíz.
  const app = await NestFactory.create(AppModule);

  // INFO: Prefijo global para todas las rutas (p. ej. /api/health)
  app.setGlobalPrefix('api');

  // SECTION: configuración de CORS
  // INFO: Habilita CORS para permitir solicitudes desde el frontend
  app.enableCors({
    origin: [
      'https://sellercontrol-ui.gerardogabriel.dev',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // INFO: Seguridad básica por cabeceras (helmet) y validación de entrada.
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // SECTION: swagger
  /**
   * Configuración de Swagger/OpenAPI.
   * - `DocumentBuilder` se usa para describir metadatos de la API.
   * - La documentación se publica en `/api/docs`.
   */
  const config = new DocumentBuilder()
    .setTitle('MarketSync SP-API')
    .setDescription('Backend NestJS para Amazon SP‑API')
    .setVersion('v1')
    .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'bearer')
    .build();

  // INFO: Genera el documento OpenAPI y lo monta en la aplicación.
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  app.use(
    '/api/scalar',
    apiReference({
      title: 'MarketSync SP-API Reference',
      content: document,
    }),
  );

  //INFO: Sirve OpenAPI JSON como middleware de Express
  app.use('/api/docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  // INFO: Inicializa el servidor HTTP en el puerto configurado.
  await app.listen(process.env.PORT || 5111);

  const url = `http://localhost:${process.env.PORT || 5111}`;
  console.log(`🚀 Server sp-amz-backend is running on: ${url}`);
  console.log(`🚀 Swagger docs available at: ${url}/api/docs`);
  console.log(`🚀 Swagger JSON available at: ${url}/api/docs-json`);
}
bootstrap();

// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)

import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  ApiTooManyRequestsResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { FeesService } from '../../application/fees.service';
import { GetFeesEstimateAsinDto } from '../../application/dto/get-fees-estimate-asin.dto';
import { FeesEstimateResponseDto } from '../../application/dto/fees-estimate-response.dto';

/** =============================================================
 * ANCHOR: controller-fees
 * Controller del dominio Fees: Expone endpoints HTTP para estimaciones
 * de comisiones de Amazon SP-API.
 * ============================================================= */

/**
 * Controller de Fees (Comisiones de Amazon)
 * 
 * Responsabilidades:
 * - Exponer endpoints HTTP para el dominio de fees
 * - Validar automáticamente los datos de entrada usando DTOs y ValidationPipe
 * - Delegar toda la lógica de negocio al servicio correspondiente
 * - Documentar endpoints en Swagger para facilitar integración
 * - Mantener el controller delgado siguiendo Single Responsibility Principle
 * 
 * Clean Architecture:
 * - Esta capa de controller pertenece a la infraestructura HTTP
 * - NO contiene lógica de negocio (eso está en use cases)
 * - NO orquesta casos de uso (eso es responsabilidad del servicio)
 * - Solo maneja HTTP: recibe requests, valida y delega al servicio
 * - Los DTOs aseguran validación automática vía ValidationPipe global
 */
@ApiTags('Fees')
@Controller('fees')
export class FeesController {
  /**
   * Constructor del controller
   * @param feesService - Servicio del dominio que orquesta los casos de uso
   */
  constructor(private readonly feesService: FeesService) {}

  /** =============================================================
   * ANCHOR: endpoint-asin-estimate
   * POST /fees/asin-estimate - Estima comisiones para un ASIN
   * ============================================================= */

  /**
   * Estima las comisiones de Amazon para un ASIN específico
   * 
   * Este endpoint permite calcular de manera precisa todas las comisiones
   * que Amazon cobrará al vender un producto dado un precio objetivo.
   * Incluye comisión de referencia, FBA fees (si aplica), y otros cargos.
   * 
   * Útil para:
   * - Calcular precio de venta óptimo
   * - Determinar margen de ganancia
   * - Comparar costos entre FBA y FBM
   * - Validar viabilidad de productos antes de listarlos
   * 
   * @param dto - DTO con los parámetros de estimación (ASIN, marketplace, precio, etc.)
   * @returns Estimación detallada de fees transformada por el mapper
   * @throws BadRequestException (400) - Validaciones de negocio fallidas
   * @throws UnauthorizedException (401) - Credenciales de SP-API inválidas
   * @throws NotFoundException (404) - ASIN no encontrado en el marketplace
   * @throws UnprocessableEntityException (422) - Parámetros de entrada inválidos
   * @throws TooManyRequestsException (429) - Rate limit de SP-API excedido
   * 
   * @example
   * POST /fees/asin-estimate
   * Body:
   * {
   *   "asin": "B08N5WRWNW",
   *   "marketplaceId": "A1AM78C64UM0Y8",
   *   "listingPriceAmount": 499.99,
   *   "listingPriceCurrency": "MXN",
   *   "isAmazonFulfilled": false
   * }
   * 
   * Response:
   * {
   *   "asin": "B08N5WRWNW",
   *   "totalFees": 74.99,
   *   "currency": "MXN",
   *   "fees": [...],
   *   "estimatedMargin": 425.00
   * }
   */
  @Post('asin-estimate')
  @ApiOperation({
    summary: 'Estimar comisiones de Amazon para un ASIN',
    description:
      'Calcula las comisiones que Amazon cobrará al vender un producto específico dado un precio objetivo. ' +
      'Incluye comisión de referencia, fees de FBA/FBM, costos de cierre, y otros cargos aplicables. ' +
      'Requiere credenciales válidas de Amazon SP-API y permisos para Product Fees API.',
  })
  @ApiOkResponse({
    description:
      'Estimación exitosa de fees. Retorna el total de comisiones, desglose detallado y margen estimado.',
    type: FeesEstimateResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Validación de negocio fallida. Ejemplos: ' +
      '- shippingCurrency diferente a listingPriceCurrency, ' +
      '- listingPriceAmount <= 0, ' +
      '- shippingAmount negativo, ' +
      '- combinación inválida de marketplace y moneda.',
    schema: {
      example: {
        statusCode: 400,
        message:
          'shippingCurrency (USD) must match listingPriceCurrency (MXN)',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Credenciales de SP-API inválidas, expiradas o sin permisos suficientes para Product Fees API.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired SP-API credentials',
        error: 'Unauthorized',
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Parámetros de entrada inválidos según class-validator. Ejemplos: ' +
      '- ASIN con longitud incorrecta, ' +
      '- marketplaceId vacío, ' +
      '- moneda no soportada (no está en VALID_CURRENCIES), ' +
      '- listingPriceAmount con formato incorrecto.',
    schema: {
      example: {
        statusCode: 422,
        message: [
          'asin must be exactly 10 characters',
          'listingPriceCurrency must be one of: MXN, USD, CAD, BRL, EUR, GBP, JPY',
        ],
        error: 'Unprocessable Entity',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description:
      'Rate limit de Amazon SP-API excedido. El cliente debe implementar retry con backoff exponencial.',
    schema: {
      example: {
        statusCode: 429,
        message:
          'Request was denied due to request throttling. Please retry after some time.',
        error: 'Too Many Requests',
      },
    },
  })
  async estimateByAsin(
    @Body() dto: GetFeesEstimateAsinDto,
  ): Promise<FeesEstimateResponseDto> {
    return this.feesService.estimateByAsin(dto);
  }

  /** =============================================================
   * ANCHOR: extensibility-points
   * Puntos de extensión para nuevos endpoints:
   * 
   * 1. Estimación por SKU:
   *    @Post('sku-estimate')
   *    @ApiOperation({ summary: 'Estimar fees por SKU' })
   *    async estimateBySku(@Body() dto: GetFeesEstimateSkuDto) {
   *      return this.feesService.estimateBySku(dto);
   *    }
   * 
   * 2. Estimación batch (múltiples ASINs):
   *    @Post('batch-estimate')
   *    @ApiOperation({ summary: 'Estimar fees para múltiples ASINs' })
   *    async estimateBatch(@Body() dto: BatchFeesEstimateDto) {
   *      return this.feesService.estimateBatch(dto);
   *    }
   * 
   * 3. Consultar historial de estimaciones:
   *    @Get('history')
   *    @ApiOperation({ summary: 'Obtener historial de estimaciones' })
   *    async getHistory(@Query() filters: FeesHistoryFiltersDto) {
   *      return this.feesService.getHistory(filters);
   *    }
   * 
   * 4. Endpoint específico para marketplace mexicano (conveniencia):
   *    @Post('mx/asin-estimate')
   *    @ApiOperation({ summary: 'Estimar fees en marketplace mexicano' })
   *    async estimateMexicanMarket(@Body() dto: MexicanMarketEstimateDto) {
   *      return this.feesService.estimateByAsin({
   *        ...dto,
   *        marketplaceId: 'A1AM78C64UM0Y8',
   *        listingPriceCurrency: 'MXN',
   *      });
   *    }
   * 
   * 5. Comparar fees entre FBA y FBM:
   *    @Post('compare')
   *    @ApiOperation({ summary: 'Comparar fees FBA vs FBM' })
   *    async compareFulfillmentMethods(@Body() dto: GetFeesEstimateAsinDto) {
   *      const fbaEstimate = await this.feesService.estimateByAsin({ ...dto, isAmazonFulfilled: true });
   *      const fbmEstimate = await this.feesService.estimateByAsin({ ...dto, isAmazonFulfilled: false });
   *      return { fba: fbaEstimate, fbm: fbmEstimate };
   *    }
   * ============================================================= */
}

/** =============================================================
 * ARQUITECTURA LIMPIA: ¿Por qué este controller cumple con Clean Architecture?
 * 
 * 1. **Single Responsibility Principle (SRP)**:
 *    - Su única responsabilidad es manejar HTTP (recibir requests, validar, responder)
 *    - NO contiene lógica de negocio (esa está en el use case)
 *    - NO orquesta casos de uso (eso lo hace el servicio)
 *    - NO transforma datos (eso lo hace el mapper)
 *    - NO se comunica con APIs externas (eso lo hace el gateway)
 *    - Solo delega al servicio que orquesta todo el flujo
 * 
 * 2. **Dependency Inversion Principle (DIP)**:
 *    - Depende del servicio (abstracción) no de implementaciones concretas
 *    - El servicio se inyecta vía constructor (Dependency Injection)
 *    - Facilita testing al poder reemplazar el servicio con mocks
 *    - Permite cambiar implementación del servicio sin modificar el controller
 * 
 * 3. **Open/Closed Principle (OCP)**:
 *    - Abierto para extensión: Se pueden agregar nuevos endpoints sin modificar los existentes
 *    - Cerrado para modificación: Los endpoints existentes no cambian al agregar nuevos
 *    - Cada endpoint es independiente y puede extenderse con decoradores
 * 
 * 4. **Validación Automática**:
 *    - Usa DTOs con decoradores de class-validator
 *    - ValidationPipe global valida automáticamente sin código adicional
 *    - Rechaza requests inválidos con 422 antes de llegar al servicio
 *    - Separa validación de entrada de lógica de negocio
 * 
 * 5. **Documentación Automática (Swagger)**:
 *    - Decoradores @Api* generan documentación automática
 *    - Facilita integración para consumidores del API
 *    - Documenta todos los casos de error posibles
 *    - Ejemplos claros de request/response
 * 
 * 6. **Separación de Capas**:
 *    - Capa de infraestructura HTTP (este controller)
 *    - Capa de aplicación (servicio que orquesta)
 *    - Capa de dominio (use cases con lógica de negocio)
 *    - Capa de infraestructura externa (gateway para SP-API)
 *    - Cada capa tiene responsabilidades bien definidas
 * 
 * ============================================================= */

/** =============================================================
 * CÓMO EXTENDER ESTE CONTROLLER:
 * 
 * 1. **Agregar nuevo endpoint**:
 *    ```typescript
 *    @Post('nuevo-endpoint')
 *    @ApiOperation({ summary: 'Descripción del nuevo endpoint' })
 *    @ApiOkResponse({ description: 'Respuesta exitosa', type: NuevoResponseDto })
 *    async nuevoEndpoint(@Body() dto: NuevoDto) {
 *      return this.feesService.nuevoMetodo(dto);
 *    }
 *    ```
 * 
 * 2. **Agregar endpoint GET con query params**:
 *    ```typescript
 *    @Get('consulta')
 *    @ApiOperation({ summary: 'Consultar recursos' })
 *    async consultar(@Query() filters: FiltrosDto) {
 *      return this.feesService.consultar(filters);
 *    }
 *    ```
 * 
 * 3. **Agregar endpoint con parámetros de ruta**:
 *    ```typescript
 *    @Get(':asin/fees')
 *    @ApiOperation({ summary: 'Obtener fees por ASIN en la ruta' })
 *    @ApiParam({ name: 'asin', description: 'ASIN del producto' })
 *    async getFeesByAsin(@Param('asin') asin: string, @Query() params: MarketplaceDto) {
 *      return this.feesService.estimateByAsin({ asin, ...params });
 *    }
 *    ```
 * 
 * 4. **Agregar guards para autenticación/autorización**:
 *    ```typescript
 *    @Post('asin-estimate')
 *    @UseGuards(AuthGuard, RolesGuard)
 *    @Roles('admin', 'seller')
 *    async estimateByAsin(@Body() dto: GetFeesEstimateAsinDto, @User() user: UserEntity) {
 *      return this.feesService.estimateByAsin(dto, user.id);
 *    }
 *    ```
 * 
 * 5. **Agregar interceptors para logging/transformación**:
 *    ```typescript
 *    @Post('asin-estimate')
 *    @UseInterceptors(LoggingInterceptor, TransformInterceptor)
 *    async estimateByAsin(@Body() dto: GetFeesEstimateAsinDto) {
 *      return this.feesService.estimateByAsin(dto);
 *    }
 *    ```
 * 
 * 6. **Agregar múltiples respuestas de error**:
 *    ```typescript
 *    @Post('asin-estimate')
 *    @ApiForbiddenResponse({ description: 'Sin permisos para este marketplace' })
 *    @ApiNotFoundResponse({ description: 'ASIN no encontrado' })
 *    async estimateByAsin(@Body() dto: GetFeesEstimateAsinDto) {
 *      return this.feesService.estimateByAsin(dto);
 *    }
 *    ```
 * ============================================================= */

/** =============================================================
 * CÓMO MODIFICAR ESTE CONTROLLER:
 * 
 * 1. **Si cambia el método del servicio**:
 *    - Actualizar la firma de la llamada en el endpoint
 *    - Ejemplo: Si el servicio ahora requiere contexto adicional
 *    ```typescript
 *    async estimateByAsin(@Body() dto: GetFeesEstimateAsinDto, @Headers('x-seller-id') sellerId: string) {
 *      return this.feesService.estimateByAsin(dto, sellerId);
 *    }
 *    ```
 * 
 * 2. **Si cambia la ruta del endpoint**:
 *    - Modificar el decorador @Post/@Get con la nueva ruta
 *    - Actualizar documentación de API_ENDPOINTS.md
 *    - Comunicar el cambio a consumidores (breaking change)
 *    ```typescript
 *    @Post('v2/asin-estimate') // Nueva versión
 *    async estimateByAsin(@Body() dto: GetFeesEstimateAsinDto) {
 *      return this.feesService.estimateByAsin(dto);
 *    }
 *    ```
 * 
 * 3. **Si cambia el DTO de entrada**:
 *    - Actualizar el tipo en @Body()
 *    - Los decoradores de class-validator manejan la validación automáticamente
 *    - Actualizar documentación de Swagger si es necesario
 *    ```typescript
 *    async estimateByAsin(@Body() dto: GetFeesEstimateAsinDtoV2) {
 *      return this.feesService.estimateByAsin(dto);
 *    }
 *    ```
 * 
 * 4. **Si cambia el tipo de respuesta**:
 *    - Actualizar @ApiOkResponse con el nuevo tipo
 *    - Actualizar el tipo de retorno del método
 *    ```typescript
 *    @ApiOkResponse({ type: NewFeesEstimateResponseDto })
 *    async estimateByAsin(@Body() dto: GetFeesEstimateAsinDto): Promise<NewFeesEstimateResponseDto> {
 *      return this.feesService.estimateByAsin(dto);
 *    }
 *    ```
 * 
 * 5. **Si necesitas agregar validación personalizada**:
 *    - Usar pipes personalizados o decoradores custom
 *    - Preferir mantener validaciones en DTOs cuando sea posible
 *    ```typescript
 *    async estimateByAsin(@Body(new CustomValidationPipe()) dto: GetFeesEstimateAsinDto) {
 *      return this.feesService.estimateByAsin(dto);
 *    }
 *    ```
 * 
 * 6. **Si necesitas cambiar el prefijo del controller**:
 *    - Modificar el decorador @Controller
 *    - Actualizar tests E2E con las nuevas rutas
 *    ```typescript
 *    @Controller('v2/fees') // Nuevo prefijo
 *    export class FeesController { ... }
 *    ```
 * ============================================================= */

/** =============================================================
 * TESTING:
 * 
 * Para testear este controller:
 * 
 * ```typescript
 * describe('FeesController', () => {
 *   let controller: FeesController;
 *   let service: FeesService;
 * 
 *   beforeEach(async () => {
 *     const module = await Test.createTestingModule({
 *       controllers: [FeesController],
 *       providers: [
 *         {
 *           provide: FeesService,
 *           useValue: { estimateByAsin: jest.fn() }, // Mock del servicio
 *         },
 *       ],
 *     }).compile();
 * 
 *     controller = module.get<FeesController>(FeesController);
 *     service = module.get<FeesService>(FeesService);
 *   });
 * 
 *   describe('estimateByAsin', () => {
 *     it('should delegate to service and return result', async () => {
 *       const dto = { asin: 'B08N5WRWNW', ... };
 *       const expected = { asin: 'B08N5WRWNW', totalFees: 74.99, ... };
 *       jest.spyOn(service, 'estimateByAsin').mockResolvedValue(expected);
 * 
 *       const result = await controller.estimateByAsin(dto);
 * 
 *       expect(service.estimateByAsin).toHaveBeenCalledWith(dto);
 *       expect(result).toEqual(expected);
 *     });
 * 
 *     it('should propagate service errors', async () => {
 *       const dto = { asin: 'INVALID', ... };
 *       jest.spyOn(service, 'estimateByAsin').mockRejectedValue(new BadRequestException());
 * 
 *       await expect(controller.estimateByAsin(dto)).rejects.toThrow(BadRequestException);
 *     });
 *   });
 * });
 * ```
 * 
 * Para tests E2E:
 * 
 * ```typescript
 * describe('Fees (e2e)', () => {
 *   it('POST /fees/asin-estimate - should return 200 with valid data', () => {
 *     return request(app.getHttpServer())
 *       .post('/fees/asin-estimate')
 *       .send({ asin: 'B08N5WRWNW', marketplaceId: 'A1AM78C64UM0Y8', ... })
 *       .expect(200)
 *       .expect((res) => {
 *         expect(res.body).toHaveProperty('totalFees');
 *         expect(res.body).toHaveProperty('currency');
 *       });
 *   });
 * 
 *   it('POST /fees/asin-estimate - should return 422 with invalid ASIN', () => {
 *     return request(app.getHttpServer())
 *       .post('/fees/asin-estimate')
 *       .send({ asin: 'INVALID', ... })
 *       .expect(422);
 *   });
 * });
 * ```
 * ============================================================= */

/** =============================================================
 * MEJORES PRÁCTICAS:
 * 
 * 1. **Mantener el controller delgado**:
 *    - Solo debe recibir, validar y delegar
 *    - NO implementar lógica de negocio aquí
 *    - NO transformar datos aquí (usar interceptors si es necesario)
 * 
 * 2. **Documentación exhaustiva en Swagger**:
 *    - Documentar todos los casos de error posibles
 *    - Incluir ejemplos claros de request/response
 *    - Describir el propósito y uso del endpoint
 * 
 * 3. **Validación robusta**:
 *    - Usar DTOs con decoradores de class-validator
 *    - Dejar que ValidationPipe maneje la validación
 *    - NO validar manualmente en el controller
 * 
 * 4. **Manejo de errores**:
 *    - Dejar que los errores se propaguen desde el servicio
 *    - NestJS los transformará en respuestas HTTP apropiadas
 *    - Usar exception filters si necesitas transformación custom
 * 
 * 5. **Versionado de API**:
 *    - Considerar versionar endpoints si cambiarán frecuentemente
 *    - Usar /v1/fees, /v2/fees para breaking changes
 *    - Mantener versiones antiguas hasta deprecación
 * 
 * 6. **Seguridad**:
 *    - Usar guards para autenticación/autorización
 *    - Validar permisos según marketplace o seller
 *    - Rate limiting para prevenir abuso
 * ============================================================= */

import { Module } from '@nestjs/common';
import { FeesController } from './interface/http/fees.controller';
import { FeesService } from './application/fees.service';
import { GetFeesEstimateForAsinUseCase } from './application/use-cases/get-fees-estimate-asin.usecase';
import { FeesMapper } from './infrastructure/mappers/fees.mapper.infrastructure';
import { SpapiProductFeesGateway } from './infrastructure/adapters/spapi.product-fees.gateway';
import { SpapiModule } from '../../shared/infrastructure/http/spapi/spapi.module';

/** =============================================================
 * ANCHOR: module-fees
 * Módulo del dominio Fees: Integra todos los componentes necesarios
 * para la estimación de comisiones de Amazon SP-API.
 * ============================================================= */

/**
 * Módulo Fees (Comisiones de Amazon)
 *
 * Este módulo integra todos los componentes del dominio Fees siguiendo
 * los principios de Clean Architecture y Dependency Injection de NestJS.
 *
 * Responsabilidades:
 * - Registrar todos los providers del dominio (service, use-cases, mappers, gateways)
 * - Configurar Dependency Injection para facilitar testing y desacoplamiento
 * - Importar módulos externos necesarios (SpapiModule para comunicación con SP-API)
 * - Exportar servicios para uso en otros módulos si es necesario
 * - Exponer controllers para endpoints HTTP
 *
 * Clean Architecture:
 * - Cada componente tiene una responsabilidad única y bien definida
 * - Los gateways se registran mediante tokens (ProductFeesPort) para inversión de dependencias
 * - Los use cases dependen de puertos (abstracciones), no de implementaciones concretas
 * - Los servicios orquestan use cases sin lógica de negocio
 * - Los controllers solo manejan HTTP, delegando al servicio
 *
 * Estructura de Dependencias:
 * ```
 * FeesController
 *   └─> FeesService
 *         └─> GetFeesEstimateForAsinUseCase
 *               ├─> ProductFeesPort (interface) → SpapiProductFeesGateway (implementación)
 *               │     └─> SpapiClient (del SpapiModule)
 *               └─> FeesMapper (lógica anti-corrupción)
 * ```
 */
@Module({
  /** =============================================================
   * ANCHOR: imports
   * Módulos externos requeridos por este dominio
   * ============================================================= */
  imports: [
    /**
     * SpapiModule: Provee SpapiClient para comunicación con Amazon SP-API
     *
     * Este módulo se importa porque el gateway SpapiProductFeesGateway
     * necesita inyectar SpapiClient para realizar las llamadas HTTP a SP-API.
     *
     * SpapiModule está configurado como global, pero lo importamos
     * explícitamente para claridad de dependencias.
     */
    SpapiModule,
  ],

  /** =============================================================
   * ANCHOR: controllers
   * Controllers HTTP que exponen los endpoints del dominio
   * ============================================================= */
  controllers: [
    /**
     * FeesController: Expone endpoints HTTP para estimaciones de fees
     *
     * Endpoints disponibles:
     * - POST /fees/asin-estimate: Estima comisiones para un ASIN dado un precio
     *
     * El controller es delgado, solo maneja HTTP y delega al servicio.
     */
    FeesController,
  ],

  /** =============================================================
   * ANCHOR: providers
   * Todos los providers del dominio registrados para Dependency Injection
   * ============================================================= */
  providers: [
    /**
     * FeesService: Servicio principal del dominio
     *
     * Orquesta los casos de uso y expone métodos públicos para los controllers.
     * Mantiene el controller delgado delegando toda la lógica a los use cases.
     */
    FeesService,

    /**
     * GetFeesEstimateForAsinUseCase: Caso de uso para estimación por ASIN
     *
     * Contiene la lógica de negocio para estimar fees:
     * - Validaciones de reglas de negocio
     * - Orquestación de gateway y mapper
     * - Manejo de errores específico del dominio
     */
    GetFeesEstimateForAsinUseCase,

    /**
     * FeesMapper: Mapper anti-corrupción
     *
     * Transforma datos de SP-API (formato externo) a entidades del dominio.
     * Protege el dominio de cambios en la API externa.
     */
    FeesMapper,

    /**
     * ProductFeesPort → SpapiProductFeesGateway
     *
     * Configuración de Dependency Injection para el gateway:
     *
     * - provide: 'ProductFeesPort' (token string)
     *   El use case inyecta usando @Inject('ProductFeesPort')
     *   Esto permite que el use case dependa de la abstracción (puerto)
     *   no de la implementación concreta (gateway)
     *
     * - useClass: SpapiProductFeesGateway
     *   La implementación concreta que se inyectará
     *   Comunica con Amazon SP-API vía SpapiClient
     *
     * Beneficios de este patrón:
     * 1. Inversión de Dependencias: Use case depende de puerto, no de gateway
     * 2. Facilita Testing: Puede reemplazarse con mock fácilmente
     * 3. Flexibilidad: Puede cambiarse por otra implementación sin modificar use case
     *
     * Ejemplo de reemplazo en tests:
     * ```typescript
     * {
     *   provide: 'ProductFeesPort',
     *   useValue: mockProductFeesGateway, // Mock en lugar del gateway real
     * }
     * ```
     *
     * Ejemplo de implementación alternativa:
     * ```typescript
     * {
     *   provide: 'ProductFeesPort',
     *   useClass: CachedProductFeesGateway, // Gateway con caché
     * }
     * ```
     */
    {
      provide: 'ProductFeesPort',
      useClass: SpapiProductFeesGateway,
    },
  ],

  /** =============================================================
   * ANCHOR: exports
   * Servicios exportados para uso en otros módulos
   * ============================================================= */
  exports: [
    /**
     * FeesService: Exportado para uso en otros módulos/features
     *
     * Permite que otros módulos consuman funcionalidad de fees:
     * - Estimación de comisiones desde otros dominios
     * - Cálculos de precios que requieren fees
     * - Reportes que incluyan información de comisiones
     *
     * Ejemplo de uso en otro módulo:
     * ```typescript
     * @Module({
     *   imports: [FeesModule], // Importar el módulo completo
     * })
     * export class OtroModule {}
     *
     * // En un servicio de OtroModule:
     * constructor(private readonly feesService: FeesService) {}
     *
     * async calcularPrecio(asin: string) {
     *   const fees = await this.feesService.estimateByAsin({ ... });
     *   return precioBase + fees.totalFees;
     * }
     * ```
     */
    FeesService,
  ],
})
export class FeesModule {}

/** =============================================================
 * ARQUITECTURA LIMPIA: ¿Por qué este módulo cumple con Clean Architecture?
 *
 * 1. **Dependency Injection (DI)**:
 *    - Todos los componentes se registran como providers
 *    - NestJS resuelve automáticamente las dependencias
 *    - No hay instanciación manual con 'new', todo vía DI
 *    - Facilita testing al poder reemplazar dependencias con mocks
 *
 * 2. **Dependency Inversion Principle (DIP)**:
 *    - Use cases dependen de puertos (ProductFeesPort), no de implementaciones
 *    - Los puertos se registran con tokens string
 *    - Las implementaciones se inyectan mediante useClass
 *    - Permite cambiar implementación sin modificar código de negocio
 *
 * 3. **Single Responsibility Principle (SRP)**:
 *    - Controller: Solo HTTP
 *    - Service: Solo orquestación
 *    - Use Case: Solo lógica de negocio
 *    - Gateway: Solo comunicación con SP-API
 *    - Mapper: Solo transformación de datos
 *    - Module: Solo configuración de DI
 *
 * 4. **Open/Closed Principle (OCP)**:
 *    - Abierto para extensión: Agregar nuevos providers sin modificar existentes
 *    - Cerrado para modificación: Los componentes existentes no cambian
 *    - Fácil agregar nuevos use cases o gateways
 *
 * 5. **Separación de Capas**:
 *    - Capa de Infraestructura HTTP: Controller
 *    - Capa de Aplicación: Service, Use Cases, DTOs
 *    - Capa de Dominio: Mappers, Entities (si existieran)
 *    - Capa de Infraestructura Externa: Gateway
 *    - Cada capa solo conoce la inmediatamente inferior
 *
 * 6. **Testabilidad**:
 *    - Todos los componentes son inyectables
 *    - Fácil reemplazar con mocks para tests unitarios
 *    - Tests de integración pueden usar módulo completo
 *    - Tests E2E pueden sobreescribir providers específicos
 *
 * ============================================================= */

/** =============================================================
 * CÓMO EXTENDER ESTE MÓDULO:
 *
 * 1. **Agregar nuevo caso de uso**:
 *    ```typescript
 *    providers: [
 *      FeesService,
 *      GetFeesEstimateForAsinUseCase,
 *      GetFeesEstimateForSkuUseCase, // NUEVO: Agregar aquí
 *      FeesMapper,
 *      { provide: 'ProductFeesPort', useClass: SpapiProductFeesGateway },
 *    ],
 *    ```
 *
 * 2. **Agregar nuevo gateway** (para otro proveedor de fees):
 *    ```typescript
 *    providers: [
 *      // ... otros providers
 *      {
 *        provide: 'AlternativeFeesPort', // Nuevo puerto
 *        useClass: AlternativeFeesGateway, // Nueva implementación
 *      },
 *    ],
 *    ```
 *
 * 3. **Agregar nuevo mapper**:
 *    ```typescript
 *    providers: [
 *      FeesService,
 *      GetFeesEstimateForAsinUseCase,
 *      FeesMapper,
 *      SkuFeesMapper, // NUEVO: Mapper para SKU fees
 *      { provide: 'ProductFeesPort', useClass: SpapiProductFeesGateway },
 *    ],
 *    ```
 *
 * 4. **Importar módulo adicional** (por ejemplo, para caché):
 *    ```typescript
 *    imports: [
 *      SpapiModule,
 *      CacheModule.register({ ttl: 300 }), // NUEVO: Caché de 5 minutos
 *    ],
 *    ```
 *
 * 5. **Exportar componentes adicionales**:
 *    ```typescript
 *    exports: [
 *      FeesService,
 *      FeesMapper, // NUEVO: Exportar mapper para uso externo
 *    ],
 *    ```
 *
 * 6. **Agregar múltiples controllers**:
 *    ```typescript
 *    controllers: [
 *      FeesController,
 *      FeesAdminController, // NUEVO: Controller para operaciones admin
 *    ],
 *    ```
 * ============================================================= */

/** =============================================================
 * CÓMO MODIFICAR ESTE MÓDULO:
 *
 * 1. **Cambiar implementación del gateway**:
 *    - Modificar useClass en el provider de ProductFeesPort
 *    - El use case no requiere cambios (depende del puerto)
 *    ```typescript
 *    {
 *      provide: 'ProductFeesPort',
 *      useClass: NewProductFeesGateway, // Cambiar implementación
 *    }
 *    ```
 *
 * 2. **Usar factory para gateway dinámico**:
 *    - Útil si la implementación depende de configuración
 *    ```typescript
 *    {
 *      provide: 'ProductFeesPort',
 *      useFactory: (config: ConfigService) => {
 *        return config.get('USE_MOCK')
 *          ? new MockProductFeesGateway()
 *          : new SpapiProductFeesGateway(spapiClient);
 *      },
 *      inject: [ConfigService, SpapiClient],
 *    }
 *    ```
 *
 * 3. **Hacer el módulo global** (si se usa en muchos lugares):
 *    ```typescript
 *    @Global() // Agregar este decorador
 *    @Module({ ... })
 *    export class FeesModule {}
 *    ```
 *
 * 4. **Agregar configuración dinámica**:
 *    ```typescript
 *    @Module({})
 *    export class FeesModule {
 *      static forRoot(options: FeesModuleOptions): DynamicModule {
 *        return {
 *          module: FeesModule,
 *          providers: [
 *            { provide: 'FEES_OPTIONS', useValue: options },
 *            // ... otros providers
 *          ],
 *        };
 *      }
 *    }
 *    ```
 *
 * 5. **Remover exportación del servicio**:
 *    - Si el dominio debe ser completamente privado
 *    ```typescript
 *    exports: [], // Remover FeesService
 *    ```
 *
 * 6. **Agregar scope específico** (por ejemplo, REQUEST scope):
 *    ```typescript
 *    {
 *      provide: FeesService,
 *      useClass: FeesService,
 *      scope: Scope.REQUEST, // Nueva instancia por request
 *    }
 *    ```
 * ============================================================= */

/** =============================================================
 * TESTING:
 *
 * Para testear componentes de este módulo:
 *
 * **Tests Unitarios (con mocks):**
 * ```typescript
 * describe('FeesService', () => {
 *   let service: FeesService;
 *
 *   beforeEach(async () => {
 *     const module = await Test.createTestingModule({
 *       providers: [
 *         FeesService,
 *         {
 *           provide: GetFeesEstimateForAsinUseCase,
 *           useValue: { execute: jest.fn() }, // Mock del use case
 *         },
 *       ],
 *     }).compile();
 *
 *     service = module.get<FeesService>(FeesService);
 *   });
 *
 *   it('should delegate to use case', async () => {
 *     // ... test
 *   });
 * });
 * ```
 *
 * **Tests de Integración (con módulo completo pero gateway mockeado):**
 * ```typescript
 * describe('FeesModule Integration', () => {
 *   let module: TestingModule;
 *
 *   beforeEach(async () => {
 *     module = await Test.createTestingModule({
 *       imports: [FeesModule],
 *     })
 *     .overrideProvider('ProductFeesPort')
 *     .useValue(mockProductFeesGateway) // Mock solo el gateway
 *     .compile();
 *   });
 *
 *   it('should wire all dependencies correctly', () => {
 *     const service = module.get<FeesService>(FeesService);
 *     expect(service).toBeDefined();
 *   });
 * });
 * ```
 *
 * **Tests E2E (con módulo completo):**
 * ```typescript
 * describe('Fees (e2e)', () => {
 *   let app: INestApplication;
 *
 *   beforeAll(async () => {
 *     const moduleFixture = await Test.createTestingModule({
 *       imports: [AppModule], // Módulo raíz que incluye FeesModule
 *     }).compile();
 *
 *     app = moduleFixture.createNestApplication();
 *     await app.init();
 *   });
 *
 *   it('POST /fees/asin-estimate', () => {
 *     return request(app.getHttpServer())
 *       .post('/fees/asin-estimate')
 *       .send({ asin: 'B08N5WRWNW', ... })
 *       .expect(200);
 *   });
 * });
 * ```
 * ============================================================= */

/** =============================================================
 * MEJORES PRÁCTICAS:
 *
 * 1. **Importar solo módulos necesarios**:
 *    - No importar módulos que no se usan
 *    - Mantener imports claros y documentados
 *
 * 2. **Registrar todos los providers**:
 *    - Asegurarse de que todos los componentes estén registrados
 *    - NestJS lanzará error si falta alguna dependencia
 *
 * 3. **Usar tokens para puertos**:
 *    - Preferir tokens string para interfaces/puertos
 *    - Facilita DI y testing
 *    - Permite múltiples implementaciones
 *
 * 4. **Documentar cada provider**:
 *    - Explicar para qué sirve cada componente
 *    - Documentar dependencias entre providers
 *
 * 5. **Exportar solo lo necesario**:
 *    - Solo exportar servicios que otros módulos deben usar
 *    - Mantener componentes internos privados
 *
 * 6. **Considerar módulos dinámicos**:
 *    - Si el módulo necesita configuración variable
 *    - Usar forRoot() o forFeature() pattern
 *
 * 7. **Mantener módulos cohesivos**:
 *    - Un módulo por dominio/bounded context
 *    - Todos los componentes relacionados juntos
 *    - Evitar módulos "god" con demasiadas responsabilidades
 * ============================================================= */

/** =============================================================
 * TROUBLESHOOTING:
 *
 * Errores comunes y soluciones:
 *
 * 1. **Error: "Cannot resolve dependency [ProductFeesPort]"**
 *    - Verificar que el provider esté registrado con el token correcto
 *    - Verificar que useClass apunte a la clase correcta
 *
 * 2. **Error: "Circular dependency"**
 *    - Usar forwardRef() si hay dependencias circulares
 *    - Refactorizar para eliminar la circularidad
 *
 * 3. **Error: "Module not found"**
 *    - Verificar que FeesModule esté importado en AppModule
 *    - Verificar rutas de importación
 *
 * 4. **Gateway no recibe SpapiClient**:
 *    - Verificar que SpapiModule esté en imports
 *    - Verificar que SpapiClient esté exportado en SpapiModule
 *
 * 5. **Tests fallan por DI**:
 *    - Usar Test.createTestingModule para crear módulo de prueba
 *    - Mockear todas las dependencias necesarias
 *    - Usar overrideProvider() para reemplazar implementaciones
 * ============================================================= */

# Baseline de Tests - Pre-Migración

**Fecha**: 2025-11-21  
**Branch**: feat/hexagonal-architecture  
**Tag**: v-pre-hexagonal-migration

## Estado de Tests

### Tests Ejecutados
- ✅ `src/shared/utils/transformers.spec.ts` - PASS
- ✅ `src/domains/fees/application/mappers/fees.mapper.spec.ts` - PASS
- ❌ `src/domains/listings/application/mappers/listings.mapper.spec.ts` - FAIL
- ❌ `src/domains/listings/application/use-cases/get-mfn-quantity.usecase.spec.ts` - FAIL

### Tests Fallando

#### 1. ListingsMapper.mapMfnQuantity
**Archivo**: `src/domains/listings/application/mappers/listings.mapper.spec.ts`
**Error**: 
```
expect(received).toBe(expected)
Expected: 7
Received: null
```
**Causa**: El mapper no está extrayendo correctamente el quantity cuando existe entrada DEFAULT

#### 2. GetMfnQuantityUseCase
**Archivo**: `src/domains/listings/application/use-cases/get-mfn-quantity.usecase.spec.ts`
**Error**:
```
NotFoundException: No hay fulfillment_availability u oferta para este SKU/marketplace (MFN).
```
**Causa**: El use case lanza excepción cuando no debería

## Acciones

### Inmediatas
- [ ] Estos tests NO bloquean la migración (son errores pre-existentes)
- [ ] Se documentan para revisión posterior
- [ ] Se corregirán durante la reestructuración del módulo listings (Fase 3)

### Durante Migración
- Mantener estos tests como referencia
- Corregir durante Fase 3 (Reestructurar listings)
- Agregar más cobertura de tests en módulos migrados

## Notas
- Los tests de `fees` y `shared/utils` están pasando ✅
- Los errores de `listings` son problemas de lógica existente, no de estructura
- La migración no debe introducir nuevas regresiones

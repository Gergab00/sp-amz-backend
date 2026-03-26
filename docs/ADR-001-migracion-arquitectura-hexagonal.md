# ADR-001: Migración a Arquitectura Hexagonal

## Estado
Aprobado

## Fecha
2025-11-21

## Contexto
El proyecto `sp-amz-backend` actualmente tiene una estructura inconsistente con múltiples carpetas (`domains/`, `features/`, `src-v2/`) que conviven sin un estándar claro. El nivel de cumplimiento con la guía de arquitectura hexagonal del proyecto es del 44%.

### Problemas Identificados:
1. Convivencia de `domains/`, `features/` y `src-v2/` sin criterio claro
2. Falta de capa `domain/` completa en algunos módulos
3. Falta de capa `interface/` en todos los módulos
4. Módulo `shared/` incompleto (solo 20% de lo requerido)
5. No existe módulo `infra/` para infraestructura transversal
6. Nomenclatura inconsistente (solo 30% sigue convención)

## Decisión
Migrar completamente el proyecto a arquitectura hexagonal siguiendo la guía oficial del proyecto (`guia_arquitectura_hexagonal_backend.instructions.md`).

### Alcance:
1. Crear módulos `shared/` e `infra/` completos
2. Reestructurar todos los módulos con capas: `domain/`, `application/`, `interface/`, `infrastructure/`
3. Aplicar nomenclatura consistente: `{feature}.{layer}.{type}.ts`
4. Consolidar `domains/`, `features/` y `src-v2/` en `modules/`
5. Implementar clases base y patrones reutilizables

### Estrategia:
- **Migración incremental**: 6 fases, 9 semanas
- **Sin impacto funcional**: Cambios estructurales, no de lógica
- **Testing continuo**: Validación en cada fase
- **Commits pequeños**: Cambios atómicos y reversibles

## Consecuencias

### Positivas:
- ✅ Arquitectura clara y mantenible
- ✅ Separación de responsabilidades bien definida
- ✅ Código más testeable
- ✅ Facilita onboarding de nuevos desarrolladores
- ✅ Escalabilidad mejorada
- ✅ Reducción de acoplamiento entre capas
- ✅ Nomenclatura predecible

### Negativas:
- ⚠️ Esfuerzo inicial de 177 horas
- ⚠️ Congelamiento de nuevas features durante 9 semanas
- ⚠️ Posibles conflictos de merge con desarrollo activo
- ⚠️ Curva de aprendizaje para el equipo

### Riesgos:
- **Regresiones funcionales**: Mitigado con suite completa de tests
- **Tiempo estimado excedido**: Buffer de 1 semana adicional
- **Conflictos de merge**: Merges frecuentes desde develop

## Alternativas Consideradas

### Alternativa 1: Mantener Status Quo
- **Pros**: Sin esfuerzo inmediato
- **Contras**: Deuda técnica creciente, confusión arquitectónica
- **Decisión**: Rechazada

### Alternativa 2: Migración Parcial
- **Pros**: Menor esfuerzo inicial
- **Contras**: Inconsistencia permanente, confusión
- **Decisión**: Rechazada

### Alternativa 3: Reescritura desde Cero
- **Pros**: Arquitectura perfecta desde inicio
- **Contras**: Muy alto riesgo, meses de desarrollo
- **Decisión**: Rechazada

## Referencias
- `guia_arquitectura_hexagonal_backend.instructions.md`
- `ANALISIS_ARQUITECTURA_HEXAGONAL.md`
- `PLAN_MIGRACION_ARQUITECTURA_HEXAGONAL.md`

## Notas
- Inicio de ejecución: Fase 0 - 21 de noviembre de 2025
- Responsable: Equipo Backend
- Revisión post-implementación: Semana 10

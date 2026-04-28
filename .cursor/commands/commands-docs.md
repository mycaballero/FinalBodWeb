---
description: Comandos Documentación — generación y mantenimiento de docs del proyecto
globs: ["docs/**/*", "**/*.md"]
alwaysApply: false
---

# ⚡ Commands Documentación — Gestión de Inventario

## Comandos de generación de documentación

Estos comandos son instrucciones para el agente de documentación. Úsalos como prefijo en tu prompt para activar el skill correspondiente.

| Comando (prompt) | Skill activado | Output esperado |
|---|---|---|
| `/generar-prd` | SK1 | `docs/PRD.md` iterado 2 veces |
| `/generar-stories` | SK2 | `docs/user-stories.md` con 8 historias Gherkin |
| `/crear-tickets` | SK3 | Archivos en `docs/tickets/backend/` y `docs/tickets/frontend/` |
| `/documentar-modelo` | SK4 | `docs/data-model.md` con entidades y relaciones |
| `/revisar-codigo [archivo]` | SK5 | Entrada en `docs/revision-log.md` |
| `/revision-360` | SK6 | Revisión final con deuda técnica y aprendizajes |

## Herramientas de Markdown

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `npx markdownlint docs/` | Verificar formato Markdown en todos los docs | Antes de hacer commit de documentación |
| `npx markdownlint docs/ --fix` | Corregir errores de formato automáticamente | Cuando hay errores de lint en Markdown |

## Estructura de archivos a crear por día

```bash
# Día 1
touch docs/PRD.md
touch docs/user-stories.md
mkdir -p docs/tickets/backend docs/tickets/frontend
touch docs/tickets/backend/BE-00{1,2,3,4,5,6}.md
touch docs/tickets/frontend/FE-00{1,2}.md

# Día 2
touch docs/data-model.md

# Día 4
touch docs/api-reference.md

# Día 7
touch docs/revision-log.md

# Día 10
# → Agregar sección de revisión 360 en docs/revision-log.md
```

## Plantillas rápidas de tickets

```bash
# Crear ticket backend desde plantilla
cat > docs/tickets/backend/BE-001.md << 'EOF'
## BE-001 — [Título en imperativo]

**User Story:** US-0X
**Estimación:** S | M | L | XL

### Descripción
[2-4 oraciones de contexto]

### Criterios de aceptación
- [ ] [Condición verificable]
- [ ] [Condición verificable]
- [ ] [Caso borde crítico]

### Notas técnicas
- [Endpoint, entidad o regla relevante]
EOF
```

## Flujo de trabajo de documentación recomendado

```
Día 1:
  1. Copiar SK1 → generar PRD.md → iterar 2 veces
  2. Copiar SK2 → generar user-stories.md
  3. Copiar SK3 → crear tickets en docs/tickets/

Día 2:
  4. Copiar SK4 → generar data-model.md

Día 4:
  5. Documentar todos los endpoints en api-reference.md

Día 7:
  6. Copiar SK5 → revisar cada servicio → registrar en revision-log.md

Día 9:
  7. Copiar prompt Stryker de skills-docs.mdc → analizar reporte → registrar hallazgos

Día 10:
  8. Copiar SK6 → escribir revisión 360 final → registrar en revision-log.md
```

## Checklist de entregables de documentación

```markdown
**Semana 1**
- [ ] docs/PRD.md — generado e iterado 2 veces
- [ ] docs/user-stories.md — 8 historias en Gherkin con 2+ escenarios cada una
- [ ] docs/tickets/backend/ — BE-001 a BE-006
- [ ] docs/tickets/frontend/ — FE-001 y FE-002
- [ ] docs/data-model.md — entidades Product y Movement documentadas con índices

**Semana 2**
- [ ] docs/revision-log.md — revisión del Día 7 con 3+ hallazgos por categoría
- [ ] docs/api-reference.md — todos los endpoints con método, ruta y descripción
- [ ] docs/revision-log.md — análisis del reporte Stryker registrado
- [ ] docs/revision-log.md — revisión 360 final con deuda técnica y aprendizajes
```

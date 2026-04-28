---
description: Agente de Documentación — PRD, User Stories Gherkin, Tickets y revisiones técnicas con IA
globs: ["docs/**/*", "**/*.md"]
alwaysApply: false
---

# 📄 Agente Documentación — Gestión de Inventario

## Rol
Eres un product manager y technical writer senior. Generas y mantienes la documentación del proyecto: PRD, user stories en Gherkin, tickets con criterios de aceptación verificables y registros de revisión técnica. Todo lo que produces es suficientemente preciso para que un desarrollador implemente sin ambigüedad.

## Contexto del sistema
- **Sistema:** Módulo de Gestión de Inventario
- **Backend:** NestJS + TypeORM + PostgreSQL
- **Frontend:** React + Vite
- **Metodología:** PRD → User Stories → Tickets → Revisión

## Estructura de carpetas de documentación
```
proyecto-inventario/
└── docs/
    ├── PRD.md
    ├── user-stories.md
    ├── data-model.md
    ├── api-reference.md
    ├── revision-log.md
    └── tickets/
        ├── backend/
        │   ├── BE-001.md … BE-006.md
        └── frontend/
            ├── FE-001.md
            └── FE-002.md
```

## User Stories esperadas para el proyecto
| ID | Tipo | Título |
|---|---|---|
| US-01 | Backend | Registrar un producto nuevo |
| US-02 | Backend | Desactivar un producto con movimientos |
| US-03 | Backend | Registrar una entrada de stock |
| US-04 | Backend | Registrar una salida sin superar el stock disponible |
| US-05 | Backend | Consultar alertas de stock mínimo |
| US-06 | Backend | Filtrar historial de movimientos por rango de fechas |
| US-07 | Frontend | Ver listado de productos con indicador de stock bajo |
| US-08 | Frontend | Registrar movimiento desde el formulario con validaciones |

## Prompts de referencia por día del curso
| Día | Actividad | Skill a usar |
|---|---|---|
| Día 1 | PRD + User Stories | SK1 + SK2 |
| Día 2 | Modelo de datos | SK4 |
| Día 7 | Revisión y refactoring | SK5 |
| Día 9 | Análisis mutation testing | Prompt en skills-docs |
| Día 10 | Revisión 360 final | Prompt en skills-docs |

## Checklist de entregables
**Semana 1**
- [ ] `docs/PRD.md` generado e iterado 2 veces
- [ ] `docs/user-stories.md` con 8 historias en Gherkin
- [ ] Tickets BE-001 a BE-006 creados
- [ ] Tickets FE-001 y FE-002 creados
- [ ] `docs/data-model.md` con entidades Product y Movement

**Semana 2**
- [ ] `docs/revision-log.md` con revisión del Día 7
- [ ] Resultados de PBT documentados
- [ ] Reporte Stryker analizado y registrado
- [ ] `docs/api-reference.md` completo
- [ ] Revisión 360 final con deuda técnica y aprendizajes

## Referencias cruzadas
- Reglas de documentación → `.cursor/rules/rules-docs.mdc`
- Skills y prompts → `.cursor/skills/skills-docs/SKILL.md`
- Comandos disponibles → `.cursor/commands/commands-docs.md`

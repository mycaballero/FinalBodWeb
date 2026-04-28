---
description: Comandos reutilizables para el flujo de trabajo de FinalBodWeb en Cursor. Semana 1 — Día 1 al 7.
---

# Commands: FinalBodWeb — Inventario

## /prd:init
```sudolang
Command prd_init {
  trigger: "/prd:init"
  description: "Genera el PRD completo del módulo indicado"
  
  prompt {
    Actúa como Product Manager Senior especializado en sistemas de inventario.
    
    Contexto del sistema:
    - Backend: NestJS + TypeORM + PostgreSQL
    - Frontend: React + Axios
    - Módulos: products, movements, inventory
    
    Dado el siguiente contexto: [PEGAR CONTEXTO DEL MÓDULO]
    
    Genera un PRD estructurado con:
    1. Objetivo del módulo (1 oración)
    2. Alcance: incluye / excluye (explícito)
    3. Actores y responsabilidades
    4. Funcionalidades con criterios de aceptación medibles
    5. Restricciones técnicas del stack
    6. Supuestos y dependencias
    
    Formato: Markdown estructurado, sin prose innecesario.
    Al final pregunta: ¿Iteramos alguna sección?
  }
}
```

---

## /prd:iterate
```sudolang
Command prd_iterate {
  trigger: "/prd:iterate [sección]"
  description: "Refina una sección específica del PRD actual"
  
  prompt {
    Dado el PRD actual: [PEGAR PRD]
    
    Refina específicamente la sección: [SECCIÓN]
    
    Razón del refinamiento: [INDICAR QUÉ MEJORAR]
    
    Mantén el resto del PRD intacto.
    Muestra solo la sección refinada con marcador ## CAMBIOS.
  }
}
```

---

## /stories:generate
```sudolang
Command stories_generate {
  trigger: "/stories:generate [módulo]"
  description: "Genera mínimo 6 User Stories en Gherkin para el módulo"
  
  prompt {
    Actúa como BDD Specialist.
    
    Módulo: [MÓDULO — products|movements|inventory|frontend]
    PRD de referencia: [PEGAR PRD O CONTEXTO]
    
    Genera User Stories en formato Gherkin canónico:
    - Mínimo 4 stories de backend Y 2 de frontend si aplica
    - Cada Feature con: caso feliz + mínimo 1 caso de error
    - Los Then deben ser observables y verificables
    - Incluir Scenario Outline cuando haya múltiples valores similares
    
    Restricciones de negocio a incluir obligatoriamente:
    - Stock salida NUNCA > stock_disponible → status 422
    - DELETE producto con movimientos → status 409
    - stock_actual <= stock_minimo → aparece en /alerts/low-stock
    
    Al finalizar cada Feature, genera el Ticket correspondiente.
  }
}
```

---

## /stories:validate
```sudolang
Command stories_validate {
  trigger: "/stories:validate"
  description: "Valida que las stories cumplan el formato Gherkin y reglas de negocio"
  
  prompt {
    Revisa las siguientes User Stories: [PEGAR STORIES]
    
    Valida cada una contra este checklist:
    ✅ Tiene Given + When + Then mínimo
    ✅ Then es observable (no vago como "el sistema procesa")
    ✅ Casos de error incluyen código HTTP específico
    ✅ Sin lógica de implementación en los pasos
    ✅ Lenguaje de dominio, no técnico
    ✅ Cubre el caso de negocio de la Feature
    
    Para cada fallo: indica la story, el problema y la corrección sugerida.
    Formato: tabla Markdown [Story | Problema | Corrección]
  }
}
```

---

## /ticket:create
```sudolang
Command ticket_create {
  trigger: "/ticket:create [story-id]"
  description: "Genera ticket de desarrollo detallado desde una User Story"
  
  prompt {
    Dada esta User Story en Gherkin: [PEGAR STORY]
    
    Genera un ticket de desarrollo con:
    
    ## Ticket: INV-[N] — [Título descriptivo]
    
    **Módulo:** products | movements | inventory | frontend
    **Prioridad:** alta | media | baja (justifica)
    **Estimación:** [S|M|L]
    
    **Historia de Usuario:**
    Como [actor] quiero [acción] para [valor]
    
    **Criterios de Aceptación:**
    (extraer directamente de los Then del Gherkin)
    - [ ] criterio 1
    - [ ] criterio 2
    
    **Definición de Done:**
    - [ ] Unit test escrito (Jest)
    - [ ] Caso de error cubierto
    - [ ] DTO validado con class-validator
    - [ ] Sin `any` en TypeScript
    - [ ] Endpoint documentado
    
    **Notas técnicas:**
    [restricciones de implementación relevantes del stack]
  }
}
```

---

## /arch:scaffold
```sudolang
Command arch_scaffold {
  trigger: "/arch:scaffold [módulo]"
  description: "Genera el scaffold de archivos NestJS para un módulo"
  
  prompt {
    Genera la estructura de archivos para el módulo NestJS: [MÓDULO]
    
    Stack: NestJS + TypeORM + PostgreSQL + TypeScript estricto
    
    Para cada archivo genera:
    1. La ruta exacta (ej: backend/src/products/products.service.ts)
    2. El contenido base con:
       - Decoradores correctos
       - Imports necesarios
       - Métodos skeleton con firma tipada
       - TODO comments donde va la lógica de negocio
    
    Reglas:
    - Sin `any`
    - DTOs con class-validator
    - Service sin lógica HTTP
    - Controller sin lógica de negocio
    - Repository pattern con TypeORM
  }
}
```

---

## /test:unit
```sudolang
Command test_unit {
  trigger: "/test:unit [servicio]"
  description: "Genera unit tests Jest para un service de NestJS"
  
  prompt {
    Dado este service de NestJS: [PEGAR SERVICE]
    
    Genera unit tests con Jest que cubran:
    1. Happy path de cada método público
    2. Casos de error y excepciones de negocio
    3. Mocks de repositorios TypeORM con jest.mock
    4. Verificación de que se llaman los métodos correctos
    
    Reglas de negocio a testear obligatoriamente:
    - salida.cantidad > stock_disponible → lanza excepción específica
    - DELETE con movimientos → lanza ConflictException
    - stock_actual <= stock_minimo → incluir en alerts
    
    Formato: describe/it anidados, un archivo por service.
  }
}
```

---

## /context:load
```sudolang
Command context_load {
  trigger: "/context:load"
  description: "Carga el contexto completo del proyecto para cualquier agente"
  
  prompt {
    CONTEXTO DEL PROYECTO — FinalBodWeb Inventario
    
    Sistema: Gestión de inventario con alertas de stock mínimo
    Backend: NestJS + TypeORM + PostgreSQL (puerto 3000)
    Frontend: React + Axios (puerto 5173)
    
    Módulos:
    - products: CRUD + desactivación lógica
    - movements: entrada/salida con validación de stock
    - inventory: stock actual + alertas de mínimo
    
    Reglas críticas de negocio:
    1. Salida NUNCA supera stock_disponible → 422
    2. DELETE con movimientos → 409, solo PATCH a inactivo
    3. stock_actual <= stock_minimo → aparece en /alerts/low-stock
    
    Endpoints canónicos: [ver finalbodweb.mdc]
    
    Con este contexto cargado, procede con: [TAREA]
  }
}
```

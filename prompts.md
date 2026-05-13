# promt inicial

- Agente Claude

```txt
ROLE: Eres un experto en prompting especialista en cursor.
CONTEXT:
- Proyecto: FinalBodWeb
- Stack: Cursor, Sudolang + Gherkin
- Estado actual: Planeación
- Restricciones: Este modelo generará Agentes cursor especializados, SKILLS, Rules, Comandos reutilizables y demas elementos  IA utiles para el desarrollo del proyecto en cursor.

OBJECTIVE: Crear prompts, agentes.md, SKILL.md y demas elementos que faciliten y mejoren la eficacia del desarrollo mediante agentes de IA ara el proyecto en el que estoy trabajando.

TASK: Al recibir una información se deben Razonar de forma coherente preguntando los detalles necesarios y sugiriendo si el output debe ser una SKILL, Rule, Command o agente especializado. posteriormente escribiendo el detalle del documento en Sudolang + Gherkino en su debido caso .md, .mdc según sea el caso requerido siempre cumpliendo con las condiciones para que sea funcional en cursor.

RULES:
- No asumir información no proporcionada
- Priorizar soluciones escalables
- Ser específico y técnico
- Evitar explicaciones innecesarias

OUTPUT FORMAT:

- Prompt o archivo para integración a Carepetas /.cursor
- Explicación breve y/o forma de ejecución o aplicación.

QUALITY CRITERIA:
- Claridad
- Precisión técnica
- Aplicabilidad real

```

Con este prompt establecí una ayuda para lo que serían las tools de IA que estaría usando durante el desarollo y que los agentes puedan utilizarlas y reutilizarlos. (Tuve que iterar varias dos o tres veces más para que generara todo lo que necesitaba).

- Curosr Agente Auto (Ejecución del agente creado).

```txt

/prd-gherkin-architect Como un Product Manager Senior.
## Vamos a generar las userHisyorys y tickets necesarios para el deslgose de la creación de labkend con el objetivo de montar el sistema desde 0. Al final el sistema debe generar los endpoints para las siguientes categorías de funcionamiento que tendrá la app:
1. Gestión de productos
El sistema permitirá registrar productos con nombre, descripción, unidad de medida (unidades, kg,
litros), categoría, stock mínimo permitido y estado (activo/inactivo). Un producto no puede ser
eliminado si tiene movimientos asociados, solo desactivado.
2. Movimientos de inventario
El sistema registrará cada movimiento indicando si es una entrada o salida, la cantidad, el producto
afectado, la fecha y una razón del movimiento (compra, venta, ajuste, merma, devolución). Una
salida no puede superar el stock disponible del producto.
3. Consulta de stock actual
Se podrá consultar el stock disponible por producto. El sistema lo calculará sumando todas las
entradas y restando todas las salidas registradas para ese producto.
4. Alerta de stock mínimo
El sistema identificará qué productos están en o por debajo de su stock mínimo configurado y los
retornará en un endpoint dedicado.
5. Historial de movimientos
Se podrá consultar el historial completo de movimientos, filtrado por producto, tipo de movimiento
(entrada/salida) y rango de fechas.

Tambien historias de usuario para la creación de la base de datos y Aqrquitectura.

```

Con este prompt se generaron las historias de usuario, tickets.

- Cursor Agente Auto (Ejecución del agente implementador).

```txt

@.cursor/agents/agent-implementador.md Vamos a implementar las primeras historias del proyecto enfocándos en backend y database.
1. plantea cuales son los pasos a seguir para que yo los valide.
2. Siempre que se vaya a implementar una historia de usuario hazme las preguntas necesarias para garantizar el entendimiento máximos de dicha historia.
3. Has un análisis del código. y Crea la documentación en el README.md 

```

- Cursor Agente Auto (PRD del frontend).

```txt

/prd-gherkin-architect 
## 🎯 Objetivo
Definir las **User Stories y comportamiento frontend** para:

1. Pantalla: **Lista de productos**
2. Pantalla: **Registro de movimiento**

El objetivo es construir un frontend robusto, con validaciones, manejo de estados y correcta integración con backend para eso deben crearse las historias de usuario y tickets necesrios para que se pueda implementar correctamente.

---

## ⚠️ Reglas obligatorias

- NO asumir comportamientos no definidos
- Implementar validaciones completas en frontend
- Manejar estados:
  - loading
  - success
  - error
- Mantener consistencia visual basada en:
  https://getdesign.md/stripe/design-md
- Código limpio, reutilizable y escalable

---

# 📦 Pantalla 1: Lista de Productos

## 🎯 Objetivo funcional
Mostrar todos los productos activos con información clave y permitir navegación al registro de movimientos.

---

## 🧾 Datos a mostrar por producto

- name
- category
- unit
- currentStock
- indicador de stock mínimo

---

## 🎨 UI / Layout

- Diseño tipo tabla o lista en card
- Columnas:
  - Nombre
  - Categoría
  - Unidad
  - Stock
- Indicador visual:
  - Si `stock <= minStock`
    - Mostrar badge o color de alerta

---

## ⚙️ Comportamiento

### Carga de datos

- Consumir endpoint:
  GET `/products`

---

### Estados

#### Loading
- Mostrar skeleton list (NO spinner vacío)

#### Error
- Mostrar mensaje claro
- Botón de retry

#### Empty
- Mostrar estado vacío:
  - “No hay productos disponibles”

---

### Interacción

- Cada producto debe ser clickeable
- Acción:
  - Navegar a pantalla de registro de movimiento
  - Enviar `productId` como parámetro

---

# 🔄 Pantalla 2: Registro de Movimiento

## 🎯 Objetivo funcional
Permitir registrar entradas o salidas de inventario con validaciones en tiempo real.

---

## 🧾 Campos del formulario

- productId (select)
- type (IN | OUT)
- quantity
- reason

---

## ⚙️ Comportamiento

### Inicialización

- Si viene `productId`:
  - Preseleccionar producto

---

## 🧪 Validaciones (TIEMPO REAL)

### quantity

- Requerido
- Número entero
- Mayor a 0

---

### type

- Requerido

---

### product

- Requerido

---

### reason

- Requerido

---

## ⚠️ Validación especial (CRÍTICA)

Si `type = OUT`:

- Obtener stock actual
- Mostrar:
  - “Stock disponible: X”
- Validar:
  - quantity <= stock
- Si no:
  - Bloquear submit
  - Mostrar error claro

---

## 🚀 Envío

### Endpoint

POST `/movements`

---

### Payload esperado

``json
{
  "productId": "",
  "type": "IN | OUT",
  "quantity": number,
  "reason": ""
}
``

---

## 🔄 Estados del submit

### Loading

- Deshabilitar botón
- Mostrar indicador

---

### Success

- Mostrar feedback (toast/snackbar)
- Acción configurable:
  - Reset form o redirección

---

### Error

- Mostrar errores del backend
- Mapear errores por campo si existen
- Mantener datos ingresados

---

# ⚙️ Manejo de errores

- Mostrar errores por campo
- Mostrar error general si falla request
- No perder estado del formulario

---

# 🎨 Lineamientos UI (Stripe-style)

- Grid de 8px
- Inputs:
  - estados: default / focus / error
- Tipografía clara y jerárquica
- Uso de colores para feedback:
  - error
  - warning (low stock)
- Componentes reutilizables

---

# 🧱 Requisitos técnicos

- Separar:
  - UI
  - lógica
  - servicios API
- Manejo de estado:
  - loading / error / data
- Código escalable
- Evitar hardcodeo

---

# 📦 Entregable esperado

- Pantalla lista de productos funcional
- Pantalla registro de movimiento funcional
- Validaciones completas
- Manejo de errores robusto
- Integración backend correcta
- UI consistente con design system

```

El agente creo la historias correctamente aunque tuve que hacer un ajuste en el prompt.

- Cursor Agente Auto (implementación del frontend).

```txt
/agent-implementador Eres un Senior frontend developer.
Vamos a implementar todo el frontend así que revisa @docs en busca de las historiar relacionadas con Frontend grantizando las mejores pácticas y correcta integración.

1. plantea cuales son los pasos a seguir para que yo los valide.
2. Siempre que se vaya a implementar una historia de usuario hazme las preguntas necesarias para garantizar el entendimiento máximos de dicha historia.
3. Has un análisis del código. y Crea la documentación en el README.md 

```

El agente implementador creó la estructura de backend correctamente.
Posteriormente vimos que faltó la implementación de acutalización de un productio y utilizamos el siguiente prompt para dicha iteración:

```txt
No tenemos la implementación para actualizar el nombre descripción y unidad del producto. entonces vamos a implementarlo:
- Valida el endpoint tipo patch de productos.
- Añade un pequeño botón de engrae en la card.
- al presionarlo entonces se precarga la información del producto en el formulario de creación y este por supuesto cambia los textos para que se entienda que está actualizando.

```

- Cursor Agent

```txt

@.cursor/agents/agent-frontend.md y @.cursor/agents/agent-backend.md

## 🎯 Rol

Actúa como un **Senior Software Engineer / Tech Lead** especializado en:

- Clean Architecture
- Clean Code
- SOLID Principles
- Escalabilidad
- Performance
- Manejo de errores
- Frontend y Backend Architecture
- Refactoring seguro
- Developer Experience (DX)

Tu objetivo es realizar una revisión técnica profunda del siguiente código:

```

[Aquí Se colocó cada uno de los módulos para la revisión. (Product, Inventory, stock, movements...)]

```

---

# 🧩 Contexto

El código pertenece a una aplicación en desarrollo y debe evaluarse con enfoque de:

- mantenibilidad
- escalabilidad
- legibilidad
- separación de responsabilidades
- robustez
- manejo de estados y errores
- performance
- buenas prácticas modernas

La revisión debe ser crítica, técnica y específica.

NO des respuestas genéricas.

---

# ⚠️ Reglas obligatorias

- NO asumir contexto no presente en el código
- Explicar claramente cada problema encontrado
- Mostrar ejemplos concretos
- Proponer soluciones reales y aplicables
- Priorizar mantenibilidad y escalabilidad
- Detectar riesgos técnicos ocultos
- Evaluar impacto de cada problema
- Indicar nivel de severidad:
  - Low
  - Medium
  - High
  - Critical

---

# 🔍 Áreas obligatorias de análisis

## 1. Arquitectura y responsabilidades

Analiza:

- separación de responsabilidades
- acoplamiento
- cohesión
- violaciones SOLID
- responsabilidades mezcladas
- dependencias innecesarias

---

## 2. Mantenibilidad

Analiza:

- legibilidad
- duplicación
- nombres ambiguos
- complejidad innecesaria
- funciones demasiado grandes
- código difícil de testear

---

## 3. Manejo de errores

Detecta:

- ausencia de try/catch
- errores silenciosos
- manejo incorrecto de excepciones
- mensajes poco claros
- ausencia de fallback states
- riesgos de crash

---

## 4. Lógica de negocio

Analiza:

- lógica incorrecta
- edge cases no contemplados
- validaciones faltantes
- estados inconsistentes
- race conditions
- side effects peligrosos

---

## 5. Performance

Detecta:

- renders innecesarios
- cálculos repetidos
- loops ineficientes
- memory leaks
- llamadas redundantes
- re-renders evitables
- problemas async

---

## 6. Escalabilidad

Analiza:

- facilidad de crecimiento
- reutilización
- modularidad
- dificultad de extensión futura
- riesgos técnicos a largo plazo

---

## 7. Testing

Evalúa:

- facilidad para testing
- dependencias difíciles de mockear
- falta de separación lógica/UI
- ausencia de patrones testeables

---

# 📋 Formato de respuesta obligatorio

Para CADA problema encontrado usar esta estructura:

---

## 🚨 Problema #N — [Título corto]

### 📍 Severidad

High / Medium / Low / Critical

### 🔎 Descripción

Explica claramente:

- qué está mal
- por qué es un problema
- impacto técnico
- riesgos futuros

---

### ❌ Código problemático

``language
// fragmento problemático
``

---

### ✅ Solución recomendada

``language
// código corregido o refactor
``

---

### 🧠 Explicación técnica

Explica:

- por qué la solución es mejor
- beneficios
- impacto en mantenibilidad
- impacto en performance
- impacto en escalabilidad

---

# 🚀 Refactoring general

Al finalizar:

## Proponer:

- mejoras arquitectónicas
- separación por capas
- custom hooks / services / repositories
- patrones recomendados
- optimizaciones generales
- mejoras DX

---

# 🧱 Reglas de calidad

La respuesta debe:

- ser extremadamente específica
- usar lenguaje técnico profesional
- priorizar soluciones modernas
- evitar opiniones vagas
- enfocarse en código production-ready

---

# 📦 Resultado esperado

Una auditoría técnica completa del código que permita:

- mejorar calidad
- reducir deuda técnica
- aumentar escalabilidad
- mejorar mantenibilidad
- prevenir bugs futuros
- facilitar testing y evolución del sistema

```

Por separado en cáda módulo identificó por lo menos 7 oportunidades de Mejora de diferentes niveles ejemplo: 

```txt
🚨 Problema #1 — Condición de carrera en salidas concurrentes (sin bloqueo ni serialización)
📍 Severidad
High (en escenarios de concurrencia real puede ser Critical para integridad de stock)

🔎 Descripción
create abre una transacción, lee el stock agregado con dos SUM y, si pasa la validación, inserta el movimiento. No hay SELECT … FOR UPDATE sobre el producto ni nivel de aislamiento elevado. Dos peticiones paralelas de salida pueden leer el mismo stock disponible, ambas pasar la comprobación dto.quantity > stock y persistir, dejando stock negativo a nivel de negocio (suma de movimientos). El try/catch con rollback solo protege fallos de excepción, no el solapamiento de lecturas.

❌ Código problemático
      const stock = await this.calculateStockByProductInTransaction(
        dto.productId,
        runner,
      );
      if (dto.type === MovementType.OUT && dto.quantity > stock) {
        throw new UnprocessableEntityException(
          'Stock insuficiente para registrar la salida',
        );
      }
      const movement = runner.manager.create(MovementEntity, {
        ...dto,
        quantity: dto.quantity.toFixed(2),
        date: new Date(dto.date),
      });
      const saved = await runner.manager.save(MovementEntity, movement);
      await runner.commitTransaction();
✅ Solución recomendada
Bloqueo pesimista: SELECT id FROM products WHERE id = $1 FOR UPDATE dentro de la misma transacción antes de recalcular stock; o
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE y reintentar en conflicto; o
restricción en BD + chequeo (más rígido de modelar).
// Dentro del try, tras startTransaction:
await runner.manager
  .createQueryBuilder(ProductEntity, 'p')
  .setLock('pessimistic_write')
  .where('p.id = :id', { id: dto.productId })
  .getOne();
// luego calculateStockByProductInTransaction y save
🧠 Explicación técnica
La regla “salida nunca supera stock” debe ser atómica respecto a otras salidas del mismo producto. El bloqueo en fila de producto serializa conflictos con coste acotado. Mantenibilidad: la intención queda explícita. Performance: pequeño coste de lock en escrituras concurrentes del mismo producto. Escalabilidad: aceptable frente a integridad rota.

```

- Cursor Agent (Auto)

```txt

## 🎯 Objetivo

Implementar una suite de testing robusta utilizando:

- Jest
- Property-Based Testing (PBT)
- Buenas prácticas de testing
- Cobertura de lógica crítica de inventario

El objetivo es validar completamente la lógica de:

- creación de productos
- movimientos de inventario
- validaciones de stock
- cálculo de stock acumulado
- reglas de negocio
- invariantes del dominio

---

# 🧠 Rol

Actúa como un Senior QA Engineer + Senior Backend Developer especializado en:

- Jest
- Property-Based Testing
- Fast-check
- Testing de lógica de negocio
- Arquitectura hexagonal
- Testing determinístico
- Cobertura de edge cases
- Prevención de regresiones

---

# ⚠️ Reglas obligatorias

- NO asumir comportamientos no definidos
- Todas las pruebas deben ser determinísticas
- Usar nombres descriptivos
- Separar claramente Arrange / Act / Assert
- Evitar mocks innecesarios
- Priorizar pruebas de dominio
- Cubrir edge cases
- Cubrir reglas críticas de negocio
- Explicar contraejemplos encontrados en PBT

---

# 📦 Testing requerido

## ✅ Generar al menos 10 pruebas unitarias con Jest

Cubrir como mínimo:

### Productos

1. Crear producto válido
2. Error al crear producto con datos inválidos
3. Desactivar producto sin movimientos
4. Desactivar producto con movimientos asociados
5. Impedir eliminación física de producto con movimientos

---

### Movimientos

6. Registrar entrada de stock
7. Registrar salida con stock suficiente
8. Rechazar salida que supera el stock
9. Rechazar cantidades negativas
10. Registrar múltiples movimientos consecutivos

---

### Stock

11. Calcular stock acumulado correctamente
12. Calcular stock después de múltiples entradas y salidas
13. Validar stock mínimo
14. Validar stock igual a cero
15. Validar productos sin movimientos

---

# 🧪 Property-Based Testing (PBT)

## ⚠️ Requisito obligatorio

Implementar al menos 3 pruebas PBT utilizando:

- fast-check
- generators/arbitraries adecuados
- propiedades invariantes del dominio

---

# 📋 Propiedades mínimas a validar

## 🔹 PBT #1 — El stock nunca debe ser negativo

### Propiedad

Para cualquier secuencia válida de movimientos:

stock >= 0

### Validar

- entradas aleatorias
- salidas aleatorias
- secuencias largas
- edge cases

---

## 🔹 PBT #2 — El stock calculado debe coincidir con la suma matemática

### Propiedad

stockFinal = SUM(entradas) - SUM(salidas)

### Validar

- secuencias aleatorias
- movimientos mixtos
- valores grandes

---

## 🔹 PBT #3 — Una salida inválida nunca debe alterar el stock

### Propiedad

Si:

salida > stock

Entonces:

stockFinal === stockInicial

---

# 🔍 Análisis de contraejemplos

## Obligatorio

Después de ejecutar las pruebas PBT:

1. Analizar los counterexamples encontrados
2. Explicar:
   - qué causó el fallo
   - qué regla fue violada
   - qué edge case apareció
3. Ajustar la lógica de negocio si es necesario
4. Mostrar el refactor aplicado
5. Re-ejecutar mentalmente la validación

---

# 🧱 Requisitos técnicos

## Testing stack

Usar:

- Jest
- fast-check

---

## Estructura esperada

/tests
  /unit
  /pbt

---

## Naming

Usar nombres descriptivos:

shouldRejectOutputMovementWhenStockIsInsufficient

---

# 📋 Formato esperado de respuesta

Para cada prueba:

---

## 🧪 Nombre de la prueba

### 🎯 Objetivo

Qué valida.

---

### ✅ Código de prueba

// test

---

### 🧠 Explicación

- Qué protege
- Qué bug previene
- Qué regla valida

---

# 🚀 Resultado esperado

El resultado final debe:

- aumentar cobertura
- prevenir regresiones
- validar reglas críticas
- detectar edge cases automáticamente
- asegurar estabilidad del dominio
- fortalecer la lógica de inventario
- demostrar robustez mediante PBT

---

# ⚠️ Calidad esperada

Las pruebas deben ser:

- mantenibles
- legibles
- aisladas
- determinísticas
- escalables
- orientadas al dominio
- production-ready

```

El agente completó 37 tests, 6 suites, 3 tests PBT.

para la mejora de los mutantes utilicé el siguiente prompt.

```txt

ROL:
Actúa como un experto Senior en Testing de Software, Mutation Testing, TDD y calidad de código.

Tienes experiencia profunda en:
- Stryker
- PIT Mutation Testing
- Infection PHP
- Jest
- PHPUnit
- JUnit
- Vitest
- Testing de backend y frontend
- Diseño de pruebas robustas
- Cobertura lógica vs cobertura superficial
- Anti-patterns en testing

OBJETIVO:
Analizar un reporte de Mutation Testing e identificar detalladamente TODOS los mutantes sobrevivientes (survived mutants).

Tu tarea es explicar:
1. Qué significa cada mutación.
2. Qué comportamiento incorrecto introdujo el mutante.
3. Por qué las pruebas actuales NO detectaron el problema.
4. Qué debilidad existe en la suite de tests.
5. Qué prueba específica debe escribirse para matar el mutante.
6. Qué assertion exacta falta.
7. Qué caso borde no fue cubierto.
8. Qué mejora arquitectónica podría ayudar si aplica.

CONTEXTO:
Voy a proporcionarte un reporte completo de mutation testing generado por herramientas como:
- Stryker
- PIT
- Infection
- u otras similares.

El reporte puede contener:
- survived mutants
- killed mutants
- timeout
- no coverage
- equivalent mutants
- mutation score

Debes enfocarte PRINCIPALMENTE en los mutantes sobrevivientes.

INSTRUCCIONES DE ANÁLISIS:

Para CADA mutante sobreviviente debes:

# 1. IDENTIFICAR EL MUTANTE
Explicar:
- archivo afectado,
- línea,
- tipo de mutación,
- código original,
- código mutado.

Ejemplo:
Original:
if (stock > 0)

Mutado:
if (stock >= 0)

# 2. EXPLICAR EL IMPACTO
Describir:
- qué comportamiento cambia,
- qué bug potencial permitiría,
- por qué es peligroso,
- qué lógica de negocio se rompe.

# 3. ANALIZAR POR QUÉ SOBREVIVIÓ
Explicar:
- qué test faltó,
- qué assertion fue insuficiente,
- qué branch nunca se ejecutó,
- si hubo mocks excesivos,
- si existe testing superficial,
- si el test solo verifica “happy path”.

# 4. PROPONER LA PRUEBA FALTANTE
Generar:
- nombre sugerido del test,
- escenario exacto,
- datos de entrada,
- assertion necesaria,
- resultado esperado.

# 5. GENERAR EL TEST
Escribir el test completo en el framework correspondiente.

IMPORTANTE:
- El test debe ser REALISTA y ejecutable.
- Debe enfocarse específicamente en matar el mutante.
- Debe seguir buenas prácticas.
- Debe tener Arrange / Act / Assert claros.

# 6. EVALUAR SI ES UN EQUIVALENT MUTANT
Analizar si el mutante podría ser equivalente:
- es decir, si el comportamiento observable nunca cambia realmente.

Si parece equivalente:
- explicarlo técnicamente,
- justificar por qué no puede matarse fácilmente.

# 7. CLASIFICAR LA GRAVEDAD
Clasificar cada mutante como:
- Baja
- Media
- Alta
- Crítica

Según el riesgo real que representa en producción.

FORMATO DE RESPUESTA:

Para cada mutante usar esta estructura EXACTA:

--------------------------------------------------
MUTANTE #X
--------------------------------------------------

📍 Archivo:
📍 Línea:
📍 Tipo de mutación:

🔹 Código original:
[código]

🔹 Código mutado:
[código]

🧠 ¿Qué cambió?
[explicación]

⚠️ Riesgo potencial:
[impacto]

❌ ¿Por qué las pruebas no lo detectaron?
[análisis profundo]

✅ Test que falta:
[explicación]

🧪 Ejemplo de prueba:
[código completo]

📊 Gravedad:
[Alta/Media/Baja/Crítica]

🟡 ¿Podría ser equivalent mutant?
[Sí/No + explicación]

--------------------------------------------------

ANÁLISIS GLOBAL FINAL:
Al terminar todos los mutantes sobrevivientes:

1. Detectar patrones comunes de debilidad:
- falta de edge cases,
- asserts débiles,
- exceso de mocks,
- ausencia de pruebas negativas,
- baja cobertura de branches,
- etc.

2. Evaluar calidad general de la suite de tests.

3. Explicar:
- qué tan confiable es el sistema actualmente,
- qué áreas tienen más riesgo,
- qué estrategia de testing debería mejorarse.

4. Proponer mejoras concretas:
- property-based testing,
- testing parametrizado,
- integración,
- contract testing,
- tests de dominio,
- reducción de mocks,
- etc.

TONO:
- Técnico
- Pedagógico
- Profundo
- Preciso
- Crítico
- Orientado a ingeniería real

OBJETIVO FINAL:
No solo listar mutantes, sino enseñar exactamente:
- qué debilidad existe en las pruebas,
- por qué el mutation testing la reveló,
- y cómo convertir la suite de tests en una suite realmente robusta.

```

Resultado de mutation testing
Estado inicial (sin cambios): ~19,6 %, 300 sobrevivientes (mucho en migraciones, seeds, main, SQL sin tests).
Estado final (última ejecución coherente antes del refactor experimental de fechas): ~99,3 % de puntuación global, 2 mutantes sobrevivientes en la misma condición compuesta de movements.service.ts línea 82 (operadores lógicos / condición compuesta de rango de fechas). Un refactor a guardas anidadas no mejoró el score (más mutantes en las nuevas ramas); se revirtió y se deja la guarda original.
Reporte HTML: backend/reports/mutation/mutation.html.


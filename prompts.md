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


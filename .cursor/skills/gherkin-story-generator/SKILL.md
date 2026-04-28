---
description: >
  SKILL reutilizable para generar User Stories en formato Gherkin BDD.
  Activa cuando el usuario pide: historias de usuario, user stories, criterios
  Gherkin, scenarios BDD, o tickets de aceptación para cualquier módulo del proyecto.
---

# SKILL: Gherkin Story Generator

## Cuándo usar esta SKILL
- Usuario pide "genera las historias de [módulo]"
- Usuario pide "escribe los scenarios para [funcionalidad]"
- Usuario pide "crea los criterios de aceptación en Gherkin"
- Usuario pide "convierte este requisito a BDD"

## Proceso de Ejecución

```sudolang
Skill GherkinGenerator {

  step 1: ParseRequirement(input) {
    extract {
      actor:        quién realiza la acción
      action:       qué quiere hacer
      value:        para qué / beneficio de negocio
      module:       products | movements | inventory | frontend
      happy_paths:  escenarios de éxito
      edge_cases:   límites, errores, restricciones
    }
    
    if ambiguous → ask("¿El actor es admin o usuario final?")
    if module unknown → ask("¿Es backend o frontend?")
  }

  step 2: GenerateFeature(parsed) {
    output format {
      Feature: [Nombre descriptivo del módulo]
        Como [actor]
        Quiero [acción específica]
        Para [valor de negocio medible]
    }
  }

  step 3: GenerateBackground(parsed) {
    if shared_preconditions exist {
      output {
        Background:
          Given [precondición 1 común a todos los scenarios]
          And   [precondición 2 si aplica]
      }
    }
  }

  step 4: GenerateScenarios(parsed) {
    for each happy_path {
      Scenario: [descripción positiva en presente]
        Given [estado inicial del sistema]
        When  [acción ejecutada]
        Then  [resultado observable]
        And   [efecto secundario si aplica]
    }
    
    for each edge_case {
      Scenario: [descripción del caso borde o error]
        Given [condición que genera el borde]
        When  [acción ejecutada]
        Then  [comportamiento de error del sistema]
        And   [mensaje o código de respuesta si aplica]
    }

    for eache resilienece_cases {
      Scenario: [Error de comunicación con el servidor]
        Given [el sistema experimenta un error de red o timeout]
        When [actor] intenta realizar [acción]
        Then [el sistema muestra un mensaje de error amigable ]
        And [permite al usuario reintentar la acción]
    }

  }

  step 5: GenerateScenarioOutline(parsed) {
    if multiple_similar_cases {
      Scenario Outline: [descripción parametrizada]
        Given [contexto con <variable>]
        When  [acción con <variable>]
        Then  [resultado con <expected>]

        Examples:
          | variable | expected |
          | [val1]   | [res1]   |
          | [val2]   | [res2]   |
    }
  }

  quality_check {
    ✅ Cada scenario tiene Given + When + Then mínimo
    ✅ Then es observable y verificable (no "el sistema procesa")
    ✅ Casos de error incluyen código HTTP o mensaje específico
    ✅ Sin lógica de implementación en los pasos
    ✅ Lenguaje del dominio del negocio (no técnico)
    ✅ Evita tecnicismos en Scenarios (ej. usar "cuando guardo" en vez de "POST /api")
    ✅ Incluye al menos un escenario de "Error de Red/Servidor" para Frontend
    ✅ Los nombres de los escenarios son únicos y descriptivos
    ✅ No hay dependencias entre escenarios (cada uno es independiente)
  }
}
```

## Plantillas por Módulo — FinalBodWeb

### Template: Productos (Backend)
```gherkin
Feature: Gestión de Productos
  Como administrador del sistema
  Quiero gestionar el catálogo de productos
  Para mantener control preciso del inventario

  Background:
    Given el sistema tiene la base de datos disponible
    And el usuario está autenticado como administrador

  Scenario: Registrar producto con datos válidos
    Given no existe un producto con nombre "Arroz Premium"
    When intento registrar un nuevo producto con datos válidos.
    Then el sistema retorna status 201
    And el producto queda almacenado con estado "activo"

  Scenario: Intentar eliminar producto con movimientos asociados
    Given existe el producto "Arroz Premium" con 3 movimientos registrados
    When envío DELETE /products/:id
    Then el sistema retorna status 409
    And el mensaje indica "Producto con movimientos no puede eliminarse"
    And el producto permanece en estado "activo"
```

### Template: Movimientos (Backend)
```gherkin
Feature: Movimientos de Inventario
  Como administrador
  Quiero registrar entradas y salidas de stock
  Para mantener el inventario actualizado

  Scenario: Registrar entrada de stock válida
    Given existe el producto "Arroz Premium" con stock_actual 50
    When intento registrar un movimiento con tipo "entrada", cantidad 20, razón "compra"
    Then el registro es exitoso
    And el stock_actual del producto es 70

  Scenario: Intentar salida que supera stock disponible
    Given existe el producto "Arroz Premium" con stock_actual 5
    When intento registrar un movimiento con tipo "salida", cantidad 10
    Then el sistema retorna estado de no procesable.
    And el mensaje indica "Stock insuficiente. Disponible: 5"

  Scenario Outline: Razones válidas de movimiento
    When intento registrar un movimiento con razón "<razon>"
    Then el registro es exitoso

    Examples:
      | razon      |
      | compra     |
      | venta      |
      | ajuste     |
      | merma      |
      | devolución |
```

### Template: Stock Mínimo (Backend)
```gherkin
Feature: Alertas de Stock Mínimo
  Como administrador
  Quiero consultar productos bajo stock mínimo
  Para tomar decisiones de reabastecimiento

  Scenario: Consultar productos en alerta
    Given el producto "Leche" tiene stock_actual 5 y stock_minimo 10
    When envío GET /inventory/alerts/low-stock
    Then el sistema retorna status 200
    And la respuesta incluye el producto "Leche"
    And el campo "stock_actual" es 5

  Scenario: Sin productos en alerta
    Given todos los productos tienen stock_actual > stock_minimo
    When envío GET /inventory/alerts/low-stock
    Then el sistema retorna status 200
    And la respuesta es un array vacío []
```

### Template: Lista de Productos (Frontend)
```gherkin
Feature: Pantalla Lista de Productos
  Como usuario del sistema
  Quiero ver el listado de productos con su stock actual
  Para identificar rápidamente productos con bajo inventario

  Scenario: Ver listado con productos activos
    Given el backend retorna 5 productos activos
    When el usuario accede a la pantalla principal
    Then se muestran 5 ProductCard con nombre, categoría y stock_actual
    And los productos con stock_actual <= stock_minimo muestran StockBadge en rojo

  Scenario: Navegar al formulario de movimiento
    Given el usuario ve la lista de productos
    When hace clic en "Registrar movimiento" del producto "Arroz Premium"
    Then el sistema navega al formulario con producto preseleccionado
```

### Template: Formulario de Movimiento (Frontend)
```gherkin
Feature: Formulario Registro de Movimiento
  Como usuario
  Quiero registrar un movimiento de stock
  Para actualizar el inventario desde la interfaz

  Scenario: Validación de cantidad en tiempo real
    Given el usuario está en el formulario de movimiento
    When ingresa cantidad "-5" en el campo de cantidad
    Then el sistema muestra error "La cantidad debe ser un entero positivo"
    And el botón de envío permanece deshabilitado

  Scenario: Salida muestra stock disponible
    Given el usuario selecciona tipo "salida"
    And el producto tiene stock_actual 30
    Then el formulario muestra "Stock disponible: 30"
    And si ingresa cantidad > 30 muestra advertencia en tiempo real

  Scenario: Envío exitoso de movimiento
    Given todos los campos son válidos
    When el usuario hace clic en "Registrar"
    Then el sistema ejecuta POST /movements
    And muestra mensaje de confirmación
    And redirige al listado de productos
```

## Output Adicional: Ticket por Story

Al finalizar cada Feature, generar automáticamente:

```
## Ticket: INV-[N] — [Feature Name]

Módulo: [backend|frontend]
Historia: Como [actor]...
Prioridad: alta | media | baja

Criterios de Aceptación:
- [ ] [extraídos directamente de los Then]

Definition of Done:
- [ ] Unit test escrito
- [ ] Caso de error cubierto
- [ ] Sin any en TypeScript
```

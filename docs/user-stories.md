# User Stories - Backend Inventario

## INV-001 - Definir modelo relacional
**Como** arquitecto backend  
**Quiero** un modelo normalizado para productos y movimientos  
**Para** garantizar integridad, trazabilidad y rendimiento base

### Criterios de aceptacion (Gherkin)
```gherkin
Given una base PostgreSQL vacia
When ejecuto la migracion inicial
Then se crean tablas products y movements con PK UUID y FK valida
And se aplican constraints de dominio para enums y campos obligatorios
```
```gherkin
Given un movimiento con product_id inexistente
When intento persistirlo
Then la base rechaza la operacion por integridad referencial
```

## INV-002 - Crear migraciones e indices iniciales
**Como** equipo backend  
**Quiero** migraciones versionadas e indices para consultas criticas  
**Para** desplegar de forma repetible y mantener performance

### Criterios de aceptacion (Gherkin)
```gherkin
Given el repositorio limpio
When ejecuto migrations:run
Then el esquema queda en version esperada sin pasos manuales
And existe indice para movements(product_id, date) y movements(type)
```
```gherkin
Given una migracion aplicada
When ejecuto rollback
Then el esquema revierte sin dejar objetos huerfanos
```

## INV-003 - Seed minima para desarrollo
**Como** desarrollador  
**Quiero** datos semilla minimos y coherentes  
**Para** probar flujos end-to-end desde el dia 1

### Criterios de aceptacion (Gherkin)
```gherkin
Given una base recien migrada
When ejecuto seed:run
Then se insertan productos activos con unidades validas
And se insertan movimientos de entrada consistentes
```
```gherkin
Given que ejecuto seed:run mas de una vez
When finaliza el proceso
Then no se duplican registros criticos
```

## INV-004 - Arquitectura modular NestJS
**Como** lider tecnico  
**Quiero** modulos products, movements, inventory y common bien separados  
**Para** escalar mantenimiento y pruebas

### Criterios de aceptacion (Gherkin)
```gherkin
Given la estructura backend inicial
When levanto la aplicacion
Then cada endpoint canonico esta enrutable desde su modulo
And controllers delegan logica de negocio a services
```

## INV-005 - Registrar producto (`POST /products`)
**Como** usuario de inventario  
**Quiero** crear productos con datos validos  
**Para** iniciar su control de stock

### Criterios de aceptacion (Gherkin)
```gherkin
Given un payload valido de producto
When consumo POST /products
Then responde 201 con id generado y estado activo por defecto
```
```gherkin
Given un payload con unidad_medida invalida
When consumo POST /products
Then responde 400 con detalle de validacion
```
```gherkin
Given un producto duplicado segun regla de unicidad
When intento crearlo nuevamente
Then responde 409 por conflicto
```

## INV-006 - Consultar productos (`GET /products`, `GET /products/:id`)
**Como** usuario de inventario  
**Quiero** listar y consultar productos por id  
**Para** visualizar catalogo operativo

### Criterios de aceptacion (Gherkin)
```gherkin
Given productos existentes
When consumo GET /products
Then responde 200 con la coleccion
```
```gherkin
Given un id inexistente
When consumo GET /products/:id
Then responde 404
```

## INV-007 - Actualizar y desactivar productos
**Como** usuario de inventario  
**Quiero** actualizar datos y desactivar productos  
**Para** mantener trazabilidad historica

### Criterios de aceptacion (Gherkin)
```gherkin
Given un producto con movimientos asociados
When consumo DELETE /products/:id
Then responde 200 y cambia estado a inactivo
And no elimina fisicamente el registro
```

## INV-008 - Registrar entrada de inventario
**Como** usuario de inventario  
**Quiero** registrar movimientos tipo entrada  
**Para** reflejar abastecimiento y ajustes positivos

### Criterios de aceptacion (Gherkin)
```gherkin
Given un producto activo y payload valido
When consumo POST /movements con tipo entrada
Then responde 201 y persiste el movimiento
```
```gherkin
Given razon no permitida o cantidad <= 0
When consumo POST /movements
Then responde 400
```

## INV-009 - Registrar salida con validacion de stock
**Como** usuario de inventario  
**Quiero** registrar salidas solo si hay stock suficiente  
**Para** evitar sobreventa

### Criterios de aceptacion (Gherkin)
```gherkin
Given un producto con stock disponible 10
When registro salida por 11
Then responde 422 por stock insuficiente
And no persiste el movimiento
```

## INV-010 - Consultar stock actual
**Como** usuario de inventario  
**Quiero** consultar stock consolidado y por producto  
**Para** tomar decisiones operativas

### Criterios de aceptacion (Gherkin)
```gherkin
Given movimientos de entrada y salida existentes
When consumo GET /inventory
Then responde 200 con stock_actual = sum(entradas) - sum(salidas)
```

## INV-011 - Alertas de stock minimo
**Como** usuario de inventario  
**Quiero** ver productos en umbral critico  
**Para** priorizar reposicion

### Criterios de aceptacion (Gherkin)
```gherkin
Given productos con stock_actual <= stock_minimo
When consumo GET /inventory/alerts/low-stock
Then responde 200 incluyendo solo productos en condicion critica
```

## INV-012 - Historial de movimientos con filtros
**Como** auditor operativo  
**Quiero** consultar movimientos por producto, tipo y fechas  
**Para** trazabilidad y analisis

### Criterios de aceptacion (Gherkin)
```gherkin
Given movimientos historicos cargados
When consumo GET /movements con filtros validos
Then responde 200 con registros que cumplen todos los filtros
```
```gherkin
Given un rango invalido (from > to)
When consumo GET /movements
Then responde 400
```

## INV-013 - Contrato uniforme de errores
**Como** consumidor API  
**Quiero** respuestas de error estandarizadas  
**Para** integrar clientes sin ambiguedad

### Criterios de aceptacion (Gherkin)
```gherkin
Given cualquier endpoint del dominio
When ocurre error de validacion
Then responde 400 con estructura estandar (code, message, details)
```
```gherkin
Given una salida que viola regla de negocio
When registro movimiento invalido
Then responde 422 con detalle de regla
```

## INV-014 - Estrategia de pruebas integral
**Como** equipo de calidad  
**Quiero** pruebas unitarias, property-based y mutation testing  
**Para** prevenir regresiones y robustecer reglas de negocio

### Criterios de aceptacion (Gherkin)
```gherkin
Given los services de products, movements e inventory
When ejecuto pruebas unitarias Jest
Then cubro casos felices, negativos y bordes criticos
```
```gherkin
Given propiedades generadas con fast-check
When ejecuto PBT
Then nunca se viola la invariante de stock no negativo para operaciones aceptadas
```
```gherkin
Given configuracion Stryker activa
When ejecuto mutation testing
Then el mutation score cumple el umbral acordado por equipo
```

## INV-015 - Lista de productos en frontend
**Como** usuario de inventario  
**Quiero** visualizar los productos activos con su stock y alertas  
**Para** decidir rapidamente sobre reposicion y registrar movimientos

### Criterios de aceptacion (Gherkin)
```gherkin
Given el backend retorna productos activos en GET /products
When ingreso a la pantalla de lista de productos
Then se renderiza una lista con nombre, categoria, unidad y stock por producto
And cada producto muestra un indicador visual cuando stock_actual <= stock_minimo
```
```gherkin
Given la pantalla de lista esta cargando datos
When se inicia la consulta de productos
Then se muestra un skeleton list
And no se muestra spinner vacio como estado principal
```
```gherkin
Given la consulta GET /products falla
When la pantalla entra en estado de error
Then se muestra un mensaje claro de error
And se muestra un boton retry para reintentar la consulta
```
```gherkin
Given GET /products responde una coleccion vacia
When finaliza la carga sin errores
Then se muestra el estado vacio con el mensaje "No hay productos disponibles"
```
```gherkin
Given el usuario visualiza productos en la lista
When hace clic en un producto
Then el sistema navega a la pantalla de registro de movimiento
And envia productId como parametro de navegacion
```
```gherkin
Given existe un error de red temporal al consultar productos
When el usuario presiona retry
Then el sistema reintenta la consulta
And si el backend responde correctamente se muestra la lista sin recargar la pagina completa
```

## INV-016 - Registro de movimiento en frontend
**Como** usuario de inventario  
**Quiero** registrar entradas y salidas con validaciones en tiempo real  
**Para** mantener el inventario actualizado sin errores de captura

### Criterios de aceptacion (Gherkin)
```gherkin
Given el usuario navega al formulario con un productId
When se inicializa la pantalla de registro de movimiento
Then el producto correspondiente queda preseleccionado en el campo productId
```
```gherkin
Given el usuario edita los campos del formulario
When ingresa valores invalidos en productId, type, quantity o reason
Then el sistema muestra errores por campo en tiempo real
And bloquea el submit hasta que los campos sean validos
```
```gherkin
Given el usuario completa quantity
When ingresa un valor no entero, vacio o menor o igual a cero
Then se muestra un error claro indicando que quantity debe ser un entero mayor a cero
And el formulario mantiene los datos ya ingresados
```
```gherkin
Given el usuario selecciona type = salida
When el formulario obtiene el stock actual del producto seleccionado
Then muestra el texto "Stock disponible: X"
And valida que quantity sea menor o igual al stock disponible
```
```gherkin
Given type = salida y quantity supera el stock disponible
When el usuario intenta enviar el formulario
Then el submit queda bloqueado
And se muestra un error claro de stock insuficiente
```
```gherkin
Given los campos son validos para registrar un movimiento
When el usuario envia el formulario
Then el frontend ejecuta POST /movements con productId, type, quantity y reason
And deshabilita el boton de envio mientras loading este activo
```
```gherkin
Given el backend confirma el registro de movimiento
When el submit finaliza en success
Then el sistema muestra feedback de confirmacion
And redirige a la lista de productos
```
```gherkin
Given POST /movements responde errores de validacion o negocio
When el submit finaliza en error
Then el sistema mapea errores por campo cuando existan
And muestra error general cuando no haya mapeo por campo
And conserva los valores ingresados en el formulario
```
```gherkin
Given el submit falla por timeout o error de red
When el usuario permanece en la pantalla de registro
Then el formulario mantiene su estado actual sin perder datos
And permite corregir o reintentar el envio
```

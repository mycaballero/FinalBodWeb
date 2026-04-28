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

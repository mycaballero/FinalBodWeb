# promt inicial

- Agente CLaude

´´
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

´´

Con este prompt establecí una ayuda para lo que serían las tools de IA que estaría usando durante el desarollo y que los agentes puedan utilizarlas y reutilizarlos.

- Curosr Agente Auto (Ejecución del agente creado).
´´

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

´´

Con este prompt se generaron las historias de usuario, tickets.
---
description: Skills de implementación Backend — NestJS + TypeORM + PostgreSQL
globs: ["backend/**/*.ts"]
alwaysApply: false
---

# 🛠️ Skills Backend — Gestión de Inventario

## SK1 — Calcular stock actual con aggregate functions

```typescript
// inventory.service.ts
async getStockByProduct(productoId: number): Promise<number> {
  const result = await this.movementRepository
    .createQueryBuilder('m')
    .select(`
      COALESCE(
        SUM(CASE WHEN m.tipo = 'entrada' THEN m.cantidad ELSE 0 END) -
        SUM(CASE WHEN m.tipo = 'salida'  THEN m.cantidad ELSE 0 END),
        0
      )
    `, 'stock')
    .where('m.productoId = :productoId', { productoId })
    .getRawOne<{ stock: string }>();

  return Number(result?.stock ?? 0);
}

async getAllInventory(): Promise<InventoryResponseDto[]> {
  return this.productRepository
    .createQueryBuilder('p')
    .leftJoin('p.movements', 'm')
    .select('p.id', 'id')
    .addSelect('p.nombre', 'nombre')
    .addSelect('p.categoria', 'categoria')
    .addSelect('p.unidadMedida', 'unidadMedida')
    .addSelect('p.stockMinimo', 'stockMinimo')
    .addSelect(`
      COALESCE(
        SUM(CASE WHEN m.tipo = 'entrada' THEN m.cantidad ELSE 0 END) -
        SUM(CASE WHEN m.tipo = 'salida'  THEN m.cantidad ELSE 0 END),
        0
      )
    `, 'stockActual')
    .where('p.activo = true')
    .groupBy('p.id')
    .getRawMany();
}
```

## SK2 — Registrar movimiento con transacción y validación de stock

```typescript
// movements.service.ts
async create(dto: CreateMovementDto): Promise<Movement> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Verificar que el producto existe y está activo
    const producto = await queryRunner.manager.findOne(Product, {
      where: { id: dto.productoId },
    });
    if (!producto) throw new NotFoundException(`Producto ${dto.productoId} no encontrado.`);
    if (!producto.activo) throw new BadRequestException('El producto está inactivo.');

    // 2. Calcular stock actual dentro de la transacción
    const stockResult = await queryRunner.manager
      .createQueryBuilder(Movement, 'm')
      .select(`
        COALESCE(
          SUM(CASE WHEN m.tipo = 'entrada' THEN m.cantidad ELSE 0 END) -
          SUM(CASE WHEN m.tipo = 'salida'  THEN m.cantidad ELSE 0 END),
          0
        )
      `, 'stock')
      .where('m.productoId = :id', { id: dto.productoId })
      .getRawOne<{ stock: string }>();

    const stockActual = Number(stockResult?.stock ?? 0);

    // 3. Validar si es salida
    if (dto.tipo === 'salida' && dto.cantidad > stockActual) {
      throw new BadRequestException(
        `La cantidad de salida (${dto.cantidad}) supera el stock disponible (${stockActual}).`
      );
    }

    // 4. Registrar el movimiento
    const movement = queryRunner.manager.create(Movement, {
      ...dto,
      producto,
    });
    const saved = await queryRunner.manager.save(movement);
    await queryRunner.commitTransaction();
    return saved;

  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

## SK3 — Desactivar producto con protección de integridad

```typescript
// products.service.ts
async remove(id: number): Promise<Product> {
  const product = await this.productRepository.findOne({ where: { id } });
  if (!product) throw new NotFoundException(`Producto ${id} no encontrado.`);

  const movimientosCount = await this.movementRepository.count({
    where: { productoId: id },
  });

  if (movimientosCount > 0) {
    // Tiene movimientos → solo desactivar
    product.activo = false;
    return this.productRepository.save(product);
  }

  // Sin movimientos → eliminar físicamente
  await this.productRepository.remove(product);
  return { ...product, id };
}
```

## SK4 — Query builder dinámico para filtros de movimientos

```typescript
// movements.service.ts
async findAll(filtros: MovementFiltersDto): Promise<Movement[]> {
  const query = this.movementRepository
    .createQueryBuilder('m')
    .leftJoinAndSelect('m.producto', 'p');

  if (filtros.productoId) {
    query.andWhere('m.productoId = :productoId', { productoId: filtros.productoId });
  }

  if (filtros.tipo) {
    query.andWhere('m.tipo = :tipo', { tipo: filtros.tipo });
  }

  if (filtros.fechaInicio && filtros.fechaFin) {
    if (new Date(filtros.fechaInicio) > new Date(filtros.fechaFin)) {
      throw new BadRequestException('fechaInicio no puede ser posterior a fechaFin.');
    }
    query.andWhere('m.fecha BETWEEN :inicio AND :fin', {
      inicio: filtros.fechaInicio,
      fin: filtros.fechaFin,
    });
  }

  return query.orderBy('m.fecha', 'DESC').getMany();
}
```

## SK5 — Configuración TypeORM y variables de entorno

```typescript
// app.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'inventario',
  entities: [Product, Movement],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
})
```

```
# .env.example
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=inventario
NODE_ENV=development
```

## SK6 — Prompt de context engineering para servicios

```
Usando este modelo de entidades [PEGAR ENTIDADES],
estas convenciones [PEGAR rules-backend.mdc]
y estos criterios de aceptación [PEGAR TICKET BE-004]:

Implementa el MovementsService en NestJS con TypeORM.
Incluye:
1. Validación de stock disponible dentro de una transacción queryRunner.
2. Rechazo de movimientos sobre productos inactivos.
3. Errores HTTP semánticos (BadRequestException, NotFoundException).
4. Sin lógica de negocio en el controlador.
```

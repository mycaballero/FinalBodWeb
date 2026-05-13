import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MovementType } from '../../movements/entities/movement.entity';
import { ProductEntity } from '../../products/entities/product.entity';

const STOCK_SUM_SQL = `COALESCE(SUM(CASE WHEN movement.type = :inType THEN movement.quantity ELSE 0 END), 0) -
 COALESCE(SUM(CASE WHEN movement.type = :outType THEN movement.quantity ELSE 0 END), 0)`;

const STOCK_PARAMS = { inType: MovementType.IN, outType: MovementType.OUT };

export type ProductWithStockRawRow = {
  id: string;
  name: string;
  description: string | null;
  unitMeasure: ProductEntity['unitMeasure'];
  minimumStock: string;
  status: ProductEntity['status'];
  currentStock: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InventoryStockRawRow = {
  productId: string;
  name: string;
  minimumStock: string;
  currentStock: string;
};

@Injectable()
export class ProductStockQueryService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  private withMovementJoin(): SelectQueryBuilder<ProductEntity> {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.movements', 'movement');
  }

  private addStockAggregate(
    qb: SelectQueryBuilder<ProductEntity>,
    alias: string,
  ): SelectQueryBuilder<ProductEntity> {
    return qb.addSelect(STOCK_SUM_SQL, alias).setParameters(STOCK_PARAMS);
  }

  async findAllProductsWithStockRaw(): Promise<ProductWithStockRawRow[]> {
    const qb = this.withMovementJoin()
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('product.description', 'description')
      .addSelect('product.unitMeasure', 'unitMeasure')
      .addSelect('product.minimumStock', 'minimumStock')
      .addSelect('product.status', 'status')
      .addSelect('product.createdAt', 'createdAt')
      .addSelect('product.updatedAt', 'updatedAt');
    this.addStockAggregate(qb, 'currentStock');
    return qb
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.description')
      .addGroupBy('product.unitMeasure')
      .addGroupBy('product.minimumStock')
      .addGroupBy('product.status')
      .addGroupBy('product.createdAt')
      .addGroupBy('product.updatedAt')
      .orderBy('product.createdAt', 'DESC')
      .getRawMany<ProductWithStockRawRow>();
  }

  async findOneProductWithStockRaw(id: string): Promise<ProductWithStockRawRow | null> {
    const qb = this.withMovementJoin()
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('product.description', 'description')
      .addSelect('product.unitMeasure', 'unitMeasure')
      .addSelect('product.minimumStock', 'minimumStock')
      .addSelect('product.status', 'status')
      .addSelect('product.createdAt', 'createdAt')
      .addSelect('product.updatedAt', 'updatedAt');
    this.addStockAggregate(qb, 'currentStock');
    const row = await qb
      .where('product.id = :id', { id })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.description')
      .addGroupBy('product.unitMeasure')
      .addGroupBy('product.minimumStock')
      .addGroupBy('product.status')
      .addGroupBy('product.createdAt')
      .addGroupBy('product.updatedAt')
      .getRawOne<ProductWithStockRawRow>();
    return row ?? null;
  }

  async findAllInventoryStockRaw(): Promise<InventoryStockRawRow[]> {
    const qb = this.withMovementJoin()
      .select('product.id', 'productId')
      .addSelect('product.name', 'name')
      .addSelect('product.minimumStock', 'minimumStock');
    this.addStockAggregate(qb, 'currentStock');
    return qb
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.minimumStock')
      .getRawMany<InventoryStockRawRow>();
  }

  async findOneInventoryStockRaw(productId: string): Promise<InventoryStockRawRow | null> {
    const qb = this.withMovementJoin()
      .select('product.id', 'productId')
      .addSelect('product.name', 'name')
      .addSelect('product.minimumStock', 'minimumStock');
    this.addStockAggregate(qb, 'currentStock');
    const row = await qb
      .where('product.id = :id', { id: productId })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.minimumStock')
      .getRawOne<InventoryStockRawRow>();
    return row ?? null;
  }
}

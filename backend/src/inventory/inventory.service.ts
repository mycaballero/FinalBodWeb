import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovementType } from '../movements/entities/movement.entity';
import { ProductEntity } from '../products/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  async findAll() {
    const rows = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.movements', 'movement')
      .select('product.id', 'productId')
      .addSelect('product.name', 'name')
      .addSelect('product.minimumStock', 'minimumStock')
      .addSelect(
        `COALESCE(SUM(CASE WHEN movement.type = :inType THEN movement.quantity ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN movement.type = :outType THEN movement.quantity ELSE 0 END), 0)`,
        'currentStock',
      )
      .setParameters({ inType: MovementType.IN, outType: MovementType.OUT })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.minimumStock')
      .getRawMany<{
        productId: string;
        name: string;
        minimumStock: string;
        currentStock: string;
      }>();

    return rows.map((row) => ({
      productId: row.productId,
      name: row.name,
      minimumStock: Number(row.minimumStock),
      currentStock: Number(row.currentStock),
    }));
  }

  async findOne(productId: string) {
    const all = await this.findAll();
    const target = all.find((item) => item.productId === productId);
    if (!target) {
      throw new NotFoundException('Producto no encontrado');
    }
    return target;
  }

  async findLowStockAlerts() {
    const all = await this.findAll();
    return all.filter((item) => item.currentStock <= item.minimumStock);
  }
}

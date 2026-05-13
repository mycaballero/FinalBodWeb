import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStockQueryService } from '../common/services/product-stock-query.service';

@Injectable()
export class InventoryService {
  constructor(private readonly productStockQuery: ProductStockQueryService) {}

  async findAll() {
    const rows = await this.productStockQuery.findAllInventoryStockRaw();
    return rows.map((row) => ({
      productId: row.productId,
      name: row.name,
      minimumStock: Number(row.minimumStock),
      currentStock: Number(row.currentStock),
    }));
  }

  async findOne(productId: string) {
    const row = await this.productStockQuery.findOneInventoryStockRaw(productId);
    if (!row) {
      throw new NotFoundException('Producto no encontrado');
    }
    return {
      productId: row.productId,
      name: row.name,
      minimumStock: Number(row.minimumStock),
      currentStock: Number(row.currentStock),
    };
  }

  async findLowStockAlerts() {
    const all = await this.findAll();
    return all.filter((item) => item.currentStock <= item.minimumStock);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('alerts/low-stock')
  findLowStock() {
    return this.inventoryService.findLowStockAlerts();
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.inventoryService.findOne(productId);
  }
}

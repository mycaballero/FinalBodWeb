import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from '../../src/inventory/inventory.controller';
import { InventoryService } from '../../src/inventory/inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  const inventoryService = {
    findAll: jest.fn(),
    findLowStockAlerts: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [{ provide: InventoryService, useValue: inventoryService }],
    }).compile();

    controller = module.get(InventoryController);
    jest.clearAllMocks();
  });

  it('shouldDelegateFindAllToService', async () => {
    const rows = [{ productId: 'p', name: 'N', minimumStock: 1, currentStock: 2 }];
    inventoryService.findAll.mockResolvedValue(rows);

    await expect(controller.findAll()).resolves.toBe(rows);
    expect(inventoryService.findAll).toHaveBeenCalledTimes(1);
  });

  it('shouldDelegateLowStockAlertsToService', async () => {
    const alerts = [{ productId: 'p', name: 'N', minimumStock: 1, currentStock: 0 }];
    inventoryService.findLowStockAlerts.mockResolvedValue(alerts);

    await expect(controller.findLowStock()).resolves.toBe(alerts);
    expect(inventoryService.findLowStockAlerts).toHaveBeenCalledTimes(1);
  });

  it('shouldDelegateFindOneToService', async () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const row = { productId: id, name: 'X', minimumStock: 1, currentStock: 0 };
    inventoryService.findOne.mockResolvedValue(row);

    await expect(controller.findOne(id)).resolves.toBe(row);
    expect(inventoryService.findOne).toHaveBeenCalledWith(id);
  });
});

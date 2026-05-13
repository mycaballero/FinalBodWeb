import { Test, TestingModule } from '@nestjs/testing';
import { ProductStockQueryService } from '../../src/common/services/product-stock-query.service';
import { InventoryService } from '../../src/inventory/inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let productStockQuery: jest.Mocked<
    Pick<
      ProductStockQueryService,
      'findAllInventoryStockRaw' | 'findOneInventoryStockRaw'
    >
  >;

  beforeEach(async () => {
    productStockQuery = {
      findAllInventoryStockRaw: jest.fn(),
      findOneInventoryStockRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: ProductStockQueryService, useValue: productStockQuery },
      ],
    }).compile();

    service = module.get(InventoryService);
  });

  it('shouldIncludeProductInLowStockAlertsWhenCurrentIsBelowMinimum', async () => {
    productStockQuery.findAllInventoryStockRaw.mockResolvedValue([
      {
        productId: 'a',
        name: 'Low',
        minimumStock: '10.00',
        currentStock: '2.00',
      },
    ]);

    const alerts = await service.findLowStockAlerts();

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toEqual(
      expect.objectContaining({
        productId: 'a',
        minimumStock: 10,
        currentStock: 2,
      }),
    );
  });

  it('shouldIncludeProductWhenCurrentStockEqualsMinimum', async () => {
    productStockQuery.findAllInventoryStockRaw.mockResolvedValue([
      {
        productId: 'b',
        name: 'Edge',
        minimumStock: '5.00',
        currentStock: '5.00',
      },
    ]);

    const alerts = await service.findLowStockAlerts();

    expect(alerts).toHaveLength(1);
    expect(alerts[0].currentStock).toBe(5);
    expect(alerts[0].minimumStock).toBe(5);
  });

  it('shouldIncludeProductWithZeroStockWhenMinimumIsZeroOrPositive', async () => {
    productStockQuery.findAllInventoryStockRaw.mockResolvedValue([
      {
        productId: 'c',
        name: 'Zero',
        minimumStock: '0.00',
        currentStock: '0.00',
      },
    ]);

    const alerts = await service.findLowStockAlerts();

    expect(alerts).toHaveLength(1);
    expect(alerts[0].currentStock).toBe(0);
  });

  it('shouldReturnEmptyAlertsWhenAllProductsAboveMinimum', async () => {
    productStockQuery.findAllInventoryStockRaw.mockResolvedValue([
      {
        productId: 'd',
        name: 'Ok',
        minimumStock: '3.00',
        currentStock: '10.00',
      },
    ]);

    const alerts = await service.findLowStockAlerts();

    expect(alerts).toHaveLength(0);
  });

  it('shouldTreatProductWithNoMovementsAsZeroCurrentStock', async () => {
    productStockQuery.findAllInventoryStockRaw.mockResolvedValue([
      {
        productId: 'e',
        name: 'Sin movimientos',
        minimumStock: '1.00',
        currentStock: '0',
      },
    ]);

    const all = await service.findAll();
    const alerts = await service.findLowStockAlerts();

    expect(all[0].currentStock).toBe(0);
    expect(alerts).toHaveLength(1);
  });

  it('shouldThrowNotFoundWhenInventoryProductMissing', async () => {
    productStockQuery.findOneInventoryStockRaw.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'Producto no encontrado',
      }),
    });
  });

  it('shouldMapFindOneInventoryRowToNumbers', async () => {
    productStockQuery.findOneInventoryStockRaw.mockResolvedValue({
      productId: '00000000-0000-4000-8000-000000000099',
      name: 'X',
      minimumStock: '2.00',
      currentStock: '9.50',
    });

    await expect(
      service.findOne('00000000-0000-4000-8000-000000000099'),
    ).resolves.toEqual({
      productId: '00000000-0000-4000-8000-000000000099',
      name: 'X',
      minimumStock: 2,
      currentStock: 9.5,
    });
  });
});

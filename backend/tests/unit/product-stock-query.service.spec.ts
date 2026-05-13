import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovementType } from '../../src/movements/entities/movement.entity';
import { ProductStockQueryService } from '../../src/common/services/product-stock-query.service';
import {
  ProductEntity,
  ProductStatus,
  ProductUnit,
} from '../../src/products/entities/product.entity';

/** Debe coincidir con `STOCK_SUM_SQL` / `STOCK_PARAMS` en product-stock-query.service.ts */
const EXPECTED_STOCK_SUM_SQL = `COALESCE(SUM(CASE WHEN movement.type = :inType THEN movement.quantity ELSE 0 END), 0) -
 COALESCE(SUM(CASE WHEN movement.type = :outType THEN movement.quantity ELSE 0 END), 0)`;

const EXPECTED_STOCK_PARAMS = {
  inType: MovementType.IN,
  outType: MovementType.OUT,
};

function createQueryBuilderMock(final: {
  getRawMany: unknown;
  getRawOne: unknown;
}) {
  const chain = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(final.getRawMany),
    getRawOne: jest.fn().mockResolvedValue(final.getRawOne),
  };
  return chain;
}

describe('ProductStockQueryService', () => {
  let service: ProductStockQueryService;
  let productsRepository: {
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    productsRepository = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductStockQueryService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: productsRepository,
        },
      ],
    }).compile();

    service = module.get(ProductStockQueryService);
  });

  it('shouldReturnAllProductsWithAggregatedStock', async () => {
    const rows = [
      {
        id: 'id-1',
        name: 'A',
        description: null,
        unitMeasure: ProductUnit.KG,
        minimumStock: '1.00',
        status: ProductStatus.ACTIVE,
        currentStock: '10.50',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      },
    ];
    const chain = createQueryBuilderMock({ getRawMany: rows, getRawOne: null });
    productsRepository.createQueryBuilder.mockReturnValue(chain);

    const result = await service.findAllProductsWithStockRaw();

    expect(result).toEqual(rows);
    expect(productsRepository.createQueryBuilder).toHaveBeenCalledWith('product');
    expect(chain.leftJoin).toHaveBeenCalledWith(
      'product.movements',
      'movement',
    );
    expect(chain.select).toHaveBeenCalledWith('product.id', 'id');
    expect(chain.addSelect).toHaveBeenCalledWith('product.name', 'name');
    expect(chain.addSelect).toHaveBeenCalledWith('product.description', 'description');
    expect(chain.addSelect).toHaveBeenCalledWith('product.unitMeasure', 'unitMeasure');
    expect(chain.addSelect).toHaveBeenCalledWith('product.minimumStock', 'minimumStock');
    expect(chain.addSelect).toHaveBeenCalledWith('product.status', 'status');
    expect(chain.addSelect).toHaveBeenCalledWith('product.createdAt', 'createdAt');
    expect(chain.addSelect).toHaveBeenCalledWith('product.updatedAt', 'updatedAt');
    expect(chain.addSelect).toHaveBeenCalledWith(
      EXPECTED_STOCK_SUM_SQL,
      'currentStock',
    );
    expect(chain.setParameters).toHaveBeenCalledWith(EXPECTED_STOCK_PARAMS);
    expect(chain.groupBy).toHaveBeenCalledWith('product.id');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.name');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.description');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.unitMeasure');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.minimumStock');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.status');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.createdAt');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.updatedAt');
    expect(chain.orderBy).toHaveBeenCalledWith('product.createdAt', 'DESC');
    expect(chain.getRawMany).toHaveBeenCalled();
  });

  it('shouldReturnOneProductRowOrNull', async () => {
    const row = {
      id: 'id-2',
      name: 'B',
      description: 'd',
      unitMeasure: ProductUnit.UNITS,
      minimumStock: '2.00',
      status: ProductStatus.INACTIVE,
      currentStock: '0.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const chain = createQueryBuilderMock({ getRawMany: [], getRawOne: row });
    productsRepository.createQueryBuilder.mockReturnValue(chain);

    const found = await service.findOneProductWithStockRaw('id-2');
    expect(found).toEqual(row);
    expect(chain.select).toHaveBeenCalledWith('product.id', 'id');
    expect(chain.addSelect).toHaveBeenCalledWith('product.name', 'name');
    expect(chain.addSelect).toHaveBeenCalledWith('product.description', 'description');
    expect(chain.addSelect).toHaveBeenCalledWith('product.unitMeasure', 'unitMeasure');
    expect(chain.addSelect).toHaveBeenCalledWith('product.minimumStock', 'minimumStock');
    expect(chain.addSelect).toHaveBeenCalledWith('product.status', 'status');
    expect(chain.addSelect).toHaveBeenCalledWith('product.createdAt', 'createdAt');
    expect(chain.addSelect).toHaveBeenCalledWith('product.updatedAt', 'updatedAt');
    expect(chain.addSelect).toHaveBeenCalledWith(
      EXPECTED_STOCK_SUM_SQL,
      'currentStock',
    );
    expect(chain.setParameters).toHaveBeenCalledWith(EXPECTED_STOCK_PARAMS);
    expect(chain.where).toHaveBeenCalledWith('product.id = :id', { id: 'id-2' });
    expect(chain.groupBy).toHaveBeenCalledWith('product.id');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.name');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.description');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.unitMeasure');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.minimumStock');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.status');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.createdAt');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.updatedAt');
    expect(chain.getRawOne).toHaveBeenCalled();
  });

  it('shouldReturnNullWhenSingleProductNotFound', async () => {
    const chain = createQueryBuilderMock({ getRawMany: [], getRawOne: undefined });
    productsRepository.createQueryBuilder.mockReturnValue(chain);

    const found = await service.findOneProductWithStockRaw('missing');
    expect(found).toBeNull();
  });

  it('shouldReturnInventoryRowsForAllProducts', async () => {
    const inv = [
      {
        productId: 'p1',
        name: 'N',
        minimumStock: '3.00',
        currentStock: '1.00',
      },
    ];
    const chain = createQueryBuilderMock({ getRawMany: inv, getRawOne: null });
    productsRepository.createQueryBuilder.mockReturnValue(chain);

    const result = await service.findAllInventoryStockRaw();
    expect(result).toEqual(inv);
    expect(chain.select).toHaveBeenCalledWith('product.id', 'productId');
    expect(chain.addSelect).toHaveBeenCalledWith('product.name', 'name');
    expect(chain.addSelect).toHaveBeenCalledWith('product.minimumStock', 'minimumStock');
    expect(chain.addSelect).toHaveBeenCalledWith(
      EXPECTED_STOCK_SUM_SQL,
      'currentStock',
    );
    expect(chain.setParameters).toHaveBeenCalledWith(EXPECTED_STOCK_PARAMS);
    expect(chain.groupBy).toHaveBeenCalledWith('product.id');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.name');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.minimumStock');
    expect(chain.getRawMany).toHaveBeenCalled();
  });

  it('shouldReturnInventoryRowForOneProductOrNull', async () => {
    const inv = {
      productId: 'p9',
      name: 'One',
      minimumStock: '1.00',
      currentStock: '5.00',
    };
    const chain = createQueryBuilderMock({ getRawMany: [], getRawOne: inv });
    productsRepository.createQueryBuilder.mockReturnValue(chain);

    expect(await service.findOneInventoryStockRaw('p9')).toEqual(inv);
    expect(chain.select).toHaveBeenCalledWith('product.id', 'productId');
    expect(chain.addSelect).toHaveBeenCalledWith('product.name', 'name');
    expect(chain.addSelect).toHaveBeenCalledWith('product.minimumStock', 'minimumStock');
    expect(chain.addSelect).toHaveBeenCalledWith(
      EXPECTED_STOCK_SUM_SQL,
      'currentStock',
    );
    expect(chain.where).toHaveBeenCalledWith('product.id = :id', { id: 'p9' });
    expect(chain.setParameters).toHaveBeenCalledWith(EXPECTED_STOCK_PARAMS);
    expect(chain.groupBy).toHaveBeenCalledWith('product.id');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.name');
    expect(chain.addGroupBy).toHaveBeenCalledWith('product.minimumStock');

    const emptyChain = createQueryBuilderMock({
      getRawMany: [],
      getRawOne: null,
    });
    productsRepository.createQueryBuilder.mockReturnValue(emptyChain);
    expect(await service.findOneInventoryStockRaw('none')).toBeNull();
  });
});

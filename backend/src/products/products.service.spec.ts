import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductStockQueryService } from '../common/services/product-stock-query.service';
import { ProductEntity, ProductStatus, ProductUnit } from './entities/product.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: jest.Mocked<Pick<Repository<ProductEntity>, 'findOne' | 'create' | 'save'>>;
  let productStockQuery: jest.Mocked<
    Pick<ProductStockQueryService, 'findAllProductsWithStockRaw' | 'findOneProductWithStockRaw'>
  >;

  beforeEach(async () => {
    productsRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    productStockQuery = {
      findAllProductsWithStockRaw: jest.fn(),
      findOneProductWithStockRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(ProductEntity), useValue: productsRepository },
        { provide: ProductStockQueryService, useValue: productStockQuery },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('findAll mapea numericos desde filas raw', async () => {
    productStockQuery.findAllProductsWithStockRaw.mockResolvedValue([
      {
        id: 'a',
        name: 'P1',
        description: null,
        unitMeasure: ProductUnit.KG,
        minimumStock: '10.00',
        status: ProductStatus.ACTIVE,
        currentStock: '3.50',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      },
    ]);

    const result = await service.findAll();

    expect(result).toEqual([
      expect.objectContaining({
        id: 'a',
        name: 'P1',
        minimumStock: 10,
        currentStock: 3.5,
      }),
    ]);
    expect(productStockQuery.findAllProductsWithStockRaw).toHaveBeenCalledTimes(1);
  });

  it('findOne lanza NotFoundException si no hay fila', async () => {
    productStockQuery.findOneProductWithStockRaw.mockResolvedValue(null);

    await expect(service.findOne('00000000-0000-4000-8000-000000000001')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('create lanza ConflictException si el nombre ya existe', async () => {
    productsRepository.findOne.mockResolvedValue({ id: 'x' } as ProductEntity);

    await expect(
      service.create({
        name: 'Dup',
        unitMeasure: ProductUnit.UNITS,
        minimumStock: 1,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

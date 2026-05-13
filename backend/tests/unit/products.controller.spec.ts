import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import { UpdateProductDto } from '../../src/products/dto/update-product.dto';
import {
  ProductEntity,
  ProductStatus,
  ProductUnit,
} from '../../src/products/entities/product.entity';
import { ProductsController } from '../../src/products/products.controller';
import { ProductWithStock, ProductsService } from '../../src/products/products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  const productsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsService }],
    }).compile();

    controller = module.get(ProductsController);
    jest.clearAllMocks();
  });

  it('shouldDelegateCreateToService', async () => {
    const dto: CreateProductDto = {
      name: 'N',
      unitMeasure: ProductUnit.UNITS,
      minimumStock: 1,
    };
    const entity = { id: 'e1' } as ProductEntity;
    productsService.create.mockResolvedValue(entity);

    await expect(controller.create(dto)).resolves.toBe(entity);
    expect(productsService.create).toHaveBeenCalledWith(dto);
  });

  it('shouldDelegateFindAllToService', async () => {
    const rows: ProductWithStock[] = [];
    productsService.findAll.mockResolvedValue(rows);

    await expect(controller.findAll()).resolves.toBe(rows);
    expect(productsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('shouldDelegateFindOneToService', async () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const row = {
      id,
      name: 'P',
      description: null,
      unitMeasure: ProductUnit.KG,
      minimumStock: 1,
      status: ProductStatus.ACTIVE,
      currentStock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ProductWithStock;
    productsService.findOne.mockResolvedValue(row);

    await expect(controller.findOne(id)).resolves.toBe(row);
    expect(productsService.findOne).toHaveBeenCalledWith(id);
  });

  it('shouldDelegateUpdateToService', async () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const dto: UpdateProductDto = { name: 'X' };
    const entity = { id } as ProductEntity;
    productsService.update.mockResolvedValue(entity);

    await expect(controller.update(id, dto)).resolves.toBe(entity);
    expect(productsService.update).toHaveBeenCalledWith(id, dto);
  });

  it('shouldDelegateDeactivateToService', async () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const entity = { id, status: ProductStatus.INACTIVE } as ProductEntity;
    productsService.deactivate.mockResolvedValue(entity);

    await expect(controller.deactivate(id)).resolves.toBe(entity);
    expect(productsService.deactivate).toHaveBeenCalledWith(id);
  });
});

import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductStockQueryService } from '../../src/common/services/product-stock-query.service';
import {
  ProductEntity,
  ProductStatus,
  ProductUnit,
} from '../../src/products/entities/product.entity';
import { ProductsService } from '../../src/products/products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: jest.Mocked<
    Pick<
      Repository<ProductEntity>,
      'findOne' | 'create' | 'save' | 'delete' | 'remove' | 'softDelete'
    >
  >;
  let productStockQuery: jest.Mocked<
    Pick<
      ProductStockQueryService,
      'findAllProductsWithStockRaw' | 'findOneProductWithStockRaw'
    >
  >;

  beforeEach(async () => {
    productsRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      softDelete: jest.fn(),
    };

    productStockQuery = {
      findAllProductsWithStockRaw: jest.fn(),
      findOneProductWithStockRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: productsRepository,
        },
        { provide: ProductStockQueryService, useValue: productStockQuery },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('shouldMapNumericFieldsWhenFindAllReturnsRawRows', async () => {
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
    expect(productStockQuery.findAllProductsWithStockRaw).toHaveBeenCalledTimes(
      1,
    );
  });

  it('shouldThrowNotFoundWhenFindOneHasNoRow', async () => {
    productStockQuery.findOneProductWithStockRaw.mockResolvedValue(null);

    await expect(
      service.findOne('00000000-0000-4000-8000-000000000001'),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'Producto no encontrado',
      }),
    });
  });

  it('shouldThrowConflictWhenCreateFindsDuplicateName', async () => {
    productsRepository.findOne.mockResolvedValue({ id: 'x' } as ProductEntity);

    await expect(
      service.create({
        name: 'Dup',
        unitMeasure: ProductUnit.UNITS,
        minimumStock: 1,
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'El producto ya existe',
      }),
    });
    expect(productsRepository.findOne).toHaveBeenCalledWith({
      where: { name: 'Dup' },
    });
  });

  it('shouldCreateProductWhenDataIsValid', async () => {
    const saved = {
      id: 'new-id',
      name: 'Nuevo',
      description: null,
      unitMeasure: ProductUnit.LITERS,
      minimumStock: '5.00',
      status: ProductStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ProductEntity;

    productsRepository.findOne.mockResolvedValue(null);
    productsRepository.create.mockReturnValue(saved);
    productsRepository.save.mockResolvedValue(saved);

    const result = await service.create({
      name: 'Nuevo',
      unitMeasure: ProductUnit.LITERS,
      minimumStock: 5,
    });

    expect(result).toBe(saved);
    expect(productsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Nuevo',
        unitMeasure: ProductUnit.LITERS,
        minimumStock: '5.00',
      }),
    );
    expect(productsRepository.save).toHaveBeenCalledWith(saved);
  });

  it('shouldMapFindOneProductRowToNumbers', async () => {
    productStockQuery.findOneProductWithStockRaw.mockResolvedValue({
      id: '00000000-0000-4000-8000-0000000000aa',
      name: 'P',
      description: null,
      unitMeasure: ProductUnit.KG,
      minimumStock: '3.25',
      status: ProductStatus.ACTIVE,
      currentStock: '10.00',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    });

    const result = await service.findOne(
      '00000000-0000-4000-8000-0000000000aa',
    );

    expect(result).toEqual(
      expect.objectContaining({
        minimumStock: 3.25,
        currentStock: 10,
      }),
    );
  });

  it('shouldDeactivateProductWhenNoMovements', async () => {
    const active = {
      id: 'p1',
      name: 'Sin movimientos',
      status: ProductStatus.ACTIVE,
    } as ProductEntity;

    productsRepository.findOne.mockResolvedValue(active);
    productsRepository.save.mockImplementation(async (p) => p as ProductEntity);

    const result = await service.deactivate('p1');

    expect(result.status).toBe(ProductStatus.INACTIVE);
    expect(productsRepository.findOne).toHaveBeenCalledWith({ where: { id: 'p1' } });
    expect(productsRepository.save).toHaveBeenCalled();
    expect(productsRepository.delete).not.toHaveBeenCalled();
    expect(productsRepository.remove).not.toHaveBeenCalled();
  });

  it('shouldDeactivateProductWhenMovementsExist', async () => {
    const active = {
      id: 'p2',
      name: 'Con movimientos',
      status: ProductStatus.ACTIVE,
      movements: [{ id: 'm1' }],
    } as ProductEntity;

    productsRepository.findOne.mockResolvedValue(active);
    productsRepository.save.mockImplementation(async (p) => p as ProductEntity);

    const result = await service.deactivate('p2');

    expect(result.status).toBe(ProductStatus.INACTIVE);
    expect(productsRepository.findOne).toHaveBeenCalledWith({ where: { id: 'p2' } });
    expect(productsRepository.delete).not.toHaveBeenCalled();
    expect(productsRepository.remove).not.toHaveBeenCalled();
  });

  it('shouldNotCallRepositoryDeleteWhenDeactivatingProduct', async () => {
    const active = {
      id: 'p3',
      status: ProductStatus.ACTIVE,
    } as ProductEntity;

    productsRepository.findOne.mockResolvedValue(active);
    productsRepository.save.mockImplementation(async (p) => p as ProductEntity);

    await service.deactivate('p3');

    expect(productsRepository.findOne).toHaveBeenCalledWith({ where: { id: 'p3' } });
    expect(productsRepository.delete).not.toHaveBeenCalled();
    expect(productsRepository.remove).not.toHaveBeenCalled();
    expect(productsRepository.softDelete).not.toHaveBeenCalled();
  });

  it('shouldUpdateOnlyProvidedFieldsAndPersist', async () => {
    const existing = {
      id: 'p-upd',
      name: 'Viejo',
      description: 'd0',
      unitMeasure: ProductUnit.UNITS,
      minimumStock: '1.00',
      status: ProductStatus.ACTIVE,
    } as ProductEntity;

    productsRepository.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(null);
    productsRepository.save.mockImplementation(async (p) => p as ProductEntity);

    const result = await service.update('p-upd', {
      name: 'Nuevo nombre',
      description: 'nueva desc',
      unitMeasure: ProductUnit.KG,
      minimumStock: 4,
    });

    expect(result.name).toBe('Nuevo nombre');
    expect(result.description).toBe('nueva desc');
    expect(result.unitMeasure).toBe(ProductUnit.KG);
    expect(result.minimumStock).toBe('4.00');
    expect(productsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Nuevo nombre',
        description: 'nueva desc',
        unitMeasure: ProductUnit.KG,
        minimumStock: '4.00',
      }),
    );
    expect(productsRepository.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 'p-upd' },
    });
  });

  it('shouldThrowConflictWhenUpdateRenamesToExistingProductName', async () => {
    const existing = {
      id: 'p-a',
      name: 'Uno',
      minimumStock: '1.00',
    } as ProductEntity;

    productsRepository.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce({ id: 'otro' } as ProductEntity);

    await expect(
      service.update('p-a', { name: 'Duplicado' }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'Ya existe un producto con ese nombre',
      }),
    });
    expect(productsRepository.findOne).toHaveBeenNthCalledWith(2, {
      where: { name: 'Duplicado' },
    });
    expect(productsRepository.save).not.toHaveBeenCalled();
  });

  it('shouldNotCheckDuplicateWhenNameUnchanged', async () => {
    const existing = {
      id: 'p-same',
      name: 'Igual',
      minimumStock: '2.00',
    } as ProductEntity;

    productsRepository.findOne.mockResolvedValueOnce(existing);
    productsRepository.save.mockImplementation(async (p) => p as ProductEntity);

    await service.update('p-same', { name: 'Igual', minimumStock: 3 });

    expect(productsRepository.findOne).toHaveBeenCalledTimes(1);
    expect(productsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ minimumStock: '3.00' }),
    );
  });

  it('shouldThrowNotFoundWhenUpdateTargetsMissingProduct', async () => {
    productsRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { name: 'X' })).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'Producto no encontrado',
      }),
    });
    expect(productsRepository.save).not.toHaveBeenCalled();
  });

  it('shouldUpdateOnlyMinimumStockWhenOtherFieldsOmitted', async () => {
    const existing = {
      id: 'p-partial',
      name: 'Fijo',
      description: 'd',
      unitMeasure: ProductUnit.LITERS,
      minimumStock: '1.00',
    } as ProductEntity;

    productsRepository.findOne.mockResolvedValueOnce(existing);
    productsRepository.save.mockImplementation(async (p) => p as ProductEntity);

    const result = await service.update('p-partial', { minimumStock: 9 });

    expect(result.name).toBe('Fijo');
    expect(result.description).toBe('d');
    expect(result.unitMeasure).toBe(ProductUnit.LITERS);
    expect(result.minimumStock).toBe('9.00');
  });

  it('shouldUpdateOnlyDescriptionWithoutTouchingMinimumStock', async () => {
    const existing = {
      id: 'p-desc',
      name: 'N',
      description: 'old',
      unitMeasure: ProductUnit.UNITS,
      minimumStock: '7.00',
    } as ProductEntity;

    productsRepository.findOne.mockResolvedValueOnce(existing);
    productsRepository.save.mockImplementation(async (p) => p as ProductEntity);

    const result = await service.update('p-desc', { description: 'new' });

    expect(result.description).toBe('new');
    expect(result.minimumStock).toBe('7.00');
  });
});

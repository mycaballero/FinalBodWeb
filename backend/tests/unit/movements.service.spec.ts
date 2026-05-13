import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ProductEntity,
  ProductStatus,
} from '../../src/products/entities/product.entity';
import {
  MovementEntity,
  MovementReason,
  MovementType,
} from '../../src/movements/entities/movement.entity';
import { MovementsService } from '../../src/movements/movements.service';

const EXPECTED_STOCK_BALANCE_SELECT = `COALESCE(SUM(CASE WHEN movement.type = :inType THEN movement.quantity ELSE 0 END), 0) -
 COALESCE(SUM(CASE WHEN movement.type = :outType THEN movement.quantity ELSE 0 END), 0)`;

const EXPECTED_STOCK_BALANCE_PARAMS = {
  inType: MovementType.IN,
  outType: MovementType.OUT,
};

function buildRunnerScenario(
  product: ProductEntity | null,
  opts?: {
    getBalance?: () => string;
    onSave?: (movement: MovementEntity) => void;
  },
) {
  const getBalance = opts?.getBalance ?? (() => '0');
  const productQb = {
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(product),
  };
  const movementQb = {
    select: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockImplementation(() =>
      Promise.resolve({ balance: getBalance() }),
    ),
  };
  let saveCount = 0;
  const manager = {
    createQueryBuilder: jest.fn((entity: unknown) =>
      entity === ProductEntity ? productQb : movementQb,
    ),
    create: jest.fn((_entity: unknown, data: unknown) => data),
    save: jest.fn(async (_entity: unknown, movement: MovementEntity) => {
      opts?.onSave?.(movement);
      saveCount += 1;
      return {
        ...movement,
        id: `saved-movement-${saveCount}`,
        createdAt: new Date(0),
      };
    }),
  };
  const runner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager,
  };
  return { runner, productQb, movementQb, manager };
}

describe('MovementsService', () => {
  const productId = '34f5ad27-b6a8-4538-9f67-92c2344be2d1';

  const baseDto = {
    productId,
    type: MovementType.OUT,
    reason: MovementReason.SALE,
    quantity: 5,
    date: new Date().toISOString(),
  };

  let service: MovementsService;
  let dataSource: { createQueryRunner: jest.Mock };
  let movementsRepository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
  };
  let productsRepository: {
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    dataSource = {
      createQueryRunner: jest.fn(),
    };
    movementsRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
    };
    productsRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementsService,
        {
          provide: getRepositoryToken(MovementEntity),
          useValue: movementsRepository,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: productsRepository,
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(MovementsService);
  });

  const activeProduct = {
    id: productId,
    status: ProductStatus.ACTIVE,
  } as ProductEntity;

  it('shouldThrowNotFoundWhenCreateAndProductDoesNotExist', async () => {
    const { runner } = buildRunnerScenario(null);
    dataSource.createQueryRunner.mockReturnValue(runner);

    await expect(service.create(baseDto)).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'Producto no encontrado',
      }),
    });
    expect(runner.rollbackTransaction).toHaveBeenCalled();
    expect(runner.commitTransaction).not.toHaveBeenCalled();
  });

  it('shouldThrowBadRequestWhenCreateAndProductIsInactive', async () => {
    const inactive = {
      id: productId,
      status: ProductStatus.INACTIVE,
    } as ProductEntity;
    const { runner } = buildRunnerScenario(inactive);
    dataSource.createQueryRunner.mockReturnValue(runner);

    await expect(service.create(baseDto)).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'No se permiten movimientos sobre productos inactivos',
      }),
    });
    expect(runner.rollbackTransaction).toHaveBeenCalled();
    expect(runner.commitTransaction).not.toHaveBeenCalled();
  });

  it('shouldRejectOutputMovementWhenStockIsInsufficient', async () => {
    const { runner } = buildRunnerScenario(activeProduct, {
      getBalance: () => '3',
    });
    dataSource.createQueryRunner.mockReturnValue(runner);

    await expect(service.create(baseDto)).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'Stock insuficiente para registrar la salida',
      }),
    });
    expect(runner.rollbackTransaction).toHaveBeenCalled();
    expect(runner.commitTransaction).not.toHaveBeenCalled();
  });

  it('shouldPersistOutboundMovementWhenStockIsSufficient', async () => {
    const { runner, productQb } = buildRunnerScenario(activeProduct, {
      getBalance: () => '100',
    });
    dataSource.createQueryRunner.mockReturnValue(runner);

    const saved = await service.create({ ...baseDto, quantity: 5 });

    expect(saved.id).toBe('saved-movement-1');
    expect(runner.manager.createQueryBuilder).toHaveBeenCalledWith(
      ProductEntity,
      'product',
    );
    expect(productQb.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(productQb.where).toHaveBeenCalledWith('product.id = :id', {
      id: productId,
    });
    expect(runner.commitTransaction).toHaveBeenCalled();
    expect(runner.rollbackTransaction).not.toHaveBeenCalled();
    expect(runner.manager.save).toHaveBeenCalled();
    expect(runner.release).toHaveBeenCalled();
    expect(runner.manager.createQueryBuilder).toHaveBeenNthCalledWith(
      1,
      ProductEntity,
      'product',
    );
    expect(runner.manager.createQueryBuilder).toHaveBeenNthCalledWith(
      2,
      MovementEntity,
      'movement',
    );
  });

  it('shouldAcceptOutboundWhenQuantityEqualsAvailableStock', async () => {
    const { runner } = buildRunnerScenario(activeProduct, {
      getBalance: () => '10',
    });
    dataSource.createQueryRunner.mockReturnValue(runner);

    const saved = await service.create({ ...baseDto, quantity: 10 });

    expect(saved.id).toBe('saved-movement-1');
    expect(runner.commitTransaction).toHaveBeenCalled();
  });

  it('shouldRegisterInboundMovement', async () => {
    const { runner } = buildRunnerScenario(activeProduct, {
      getBalance: () => '0',
    });
    dataSource.createQueryRunner.mockReturnValue(runner);

    const saved = await service.create({
      ...baseDto,
      type: MovementType.IN,
      reason: MovementReason.PURCHASE,
      quantity: 25,
    });

    expect(saved.type).toBe(MovementType.IN);
    expect(runner.commitTransaction).toHaveBeenCalled();
  });

  it('shouldRejectMovementWhenQuantityIsNotPositive', async () => {
    const { runner } = buildRunnerScenario(activeProduct, {
      getBalance: () => '100',
    });
    dataSource.createQueryRunner.mockReturnValue(runner);

    await expect(
      service.create({
        ...baseDto,
        quantity: 0,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(runner.commitTransaction).not.toHaveBeenCalled();
  });

  it('shouldRegisterMultipleConsecutiveMovements', async () => {
    let simulatedBalance = 0;
    const { runner } = buildRunnerScenario(activeProduct, {
      getBalance: () => String(simulatedBalance),
      onSave: (m) => {
        const qty = Number(m.quantity);
        if (m.type === MovementType.IN) {
          simulatedBalance += qty;
        } else {
          simulatedBalance -= qty;
        }
      },
    });
    dataSource.createQueryRunner.mockReturnValue(runner);

    await service.create({
      ...baseDto,
      type: MovementType.IN,
      reason: MovementReason.PURCHASE,
      quantity: 10,
    });
    await service.create({
      ...baseDto,
      type: MovementType.OUT,
      reason: MovementReason.SALE,
      quantity: 3,
    });

    expect(simulatedBalance).toBe(7);
    expect(runner.commitTransaction).toHaveBeenCalledTimes(2);
  });

  it('shouldReturnCalculatedStockForProduct', async () => {
    productsRepository.findOne.mockResolvedValue(activeProduct);
    const movementQb = {
      select: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ balance: '42.50' }),
    };
    movementsRepository.createQueryBuilder.mockReturnValue(movementQb);

    const stock = await service.calculateStockByProduct(productId);

    expect(stock).toBe(42.5);
    expect(productsRepository.findOne).toHaveBeenCalledWith({
      where: { id: productId },
    });
    expect(movementsRepository.createQueryBuilder).toHaveBeenCalledWith('movement');
    expect(movementQb.select).toHaveBeenCalledWith(
      EXPECTED_STOCK_BALANCE_SELECT,
      'balance',
    );
    expect(movementQb.setParameters).toHaveBeenCalledWith(
      EXPECTED_STOCK_BALANCE_PARAMS,
    );
    expect(movementQb.where).toHaveBeenCalledWith(
      'movement.productId = :productId',
      { productId },
    );
  });

  it('shouldCalculateStockAsZeroWhenProductHasNoMovements', async () => {
    productsRepository.findOne.mockResolvedValue(activeProduct);
    const movementQb = {
      select: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ balance: null }),
    };
    movementsRepository.createQueryBuilder.mockReturnValue(movementQb);

    const stock = await service.calculateStockByProduct(productId);

    expect(stock).toBe(0);
    expect(productsRepository.findOne).toHaveBeenCalledWith({
      where: { id: productId },
    });
    expect(movementQb.select).toHaveBeenCalledWith(
      EXPECTED_STOCK_BALANCE_SELECT,
      'balance',
    );
  });

  it('shouldTreatMissingBalanceRowAsZeroStock', async () => {
    productsRepository.findOne.mockResolvedValue(activeProduct);
    const movementQb = {
      select: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(undefined),
    };
    movementsRepository.createQueryBuilder.mockReturnValue(movementQb);

    const stock = await service.calculateStockByProduct(productId);

    expect(stock).toBe(0);
  });

  it('shouldThrowNotFoundWhenCalculatingStockForMissingProduct', async () => {
    productsRepository.findOne.mockResolvedValue(null);

    await expect(service.calculateStockByProduct(productId)).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'Producto no encontrado',
      }),
    });
  });

  it('shouldThrowBadRequestWhenFindAllDateRangeIsInverted', async () => {
    await expect(
      service.findAll({
        from: '2024-12-31T00:00:00.000Z',
        to: '2024-01-01T00:00:00.000Z',
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message:
          'El rango de fechas es invalido: from no puede ser mayor que to',
      }),
    });
    expect(movementsRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('shouldNotRejectFindAllWhenOnlyFromDateProvided', async () => {
    const chain = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    movementsRepository.createQueryBuilder.mockReturnValue(chain);

    await service.findAll({ from: '2024-06-01T00:00:00.000Z' });

    expect(chain.getMany).toHaveBeenCalled();
  });

  it('shouldAllowFindAllWhenFromEqualsTo', async () => {
    const ts = '2024-06-01T12:00:00.000Z';
    const chain = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    movementsRepository.createQueryBuilder.mockReturnValue(chain);

    await service.findAll({ from: ts, to: ts });

    expect(chain.getMany).toHaveBeenCalled();
  });

  it('shouldApplyFiltersAndOrderWhenFindAll', async () => {
    const list = [{ id: 'm1' }] as MovementEntity[];
    const chain = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(list),
    };
    movementsRepository.createQueryBuilder.mockReturnValue(chain);

    const from = '2024-01-01T00:00:00.000Z';
    const to = '2024-12-31T23:59:59.999Z';
    const result = await service.findAll({
      productId,
      type: MovementType.IN,
      from,
      to,
    });

    expect(result).toBe(list);
    expect(movementsRepository.createQueryBuilder).toHaveBeenCalledWith('movement');
    expect(chain.andWhere).toHaveBeenCalledTimes(4);
    expect(chain.andWhere).toHaveBeenCalledWith(
      'movement.productId = :productId',
      { productId },
    );
    expect(chain.andWhere).toHaveBeenCalledWith('movement.type = :type', {
      type: MovementType.IN,
    });
    expect(chain.andWhere).toHaveBeenCalledWith('movement.date >= :from', {
      from,
    });
    expect(chain.andWhere).toHaveBeenCalledWith('movement.date <= :to', {
      to,
    });
    expect(chain.orderBy).toHaveBeenCalledWith('movement.date', 'DESC');
    expect(chain.getMany).toHaveBeenCalled();
  });

  it('shouldNotApplyOptionalFiltersWhenFindAllQueryEmpty', async () => {
    const chain = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    movementsRepository.createQueryBuilder.mockReturnValue(chain);

    await service.findAll({});

    expect(chain.andWhere).not.toHaveBeenCalled();
    expect(movementsRepository.createQueryBuilder).toHaveBeenCalledWith('movement');
  });

  it('shouldReturnMovementWhenFindOneExists', async () => {
    const movement = { id: 'mid', productId } as MovementEntity;
    movementsRepository.findOne.mockResolvedValue(movement);

    await expect(service.findOne('mid')).resolves.toBe(movement);
    expect(movementsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'mid' },
    });
  });

  it('shouldThrowNotFoundWhenFindOneMissing', async () => {
    movementsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'Movimiento no encontrado',
      }),
    });
  });
});

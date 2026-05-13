import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductEntity, ProductStatus } from '../products/entities/product.entity';
import { MovementReason, MovementEntity, MovementType } from './entities/movement.entity';
import { MovementsService } from './movements.service';

function buildRunnerScenario(opts: {
  product: ProductEntity | null;
  balance: string;
}) {
  const productQb = {
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(opts.product),
  };
  const movementQb = {
    select: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ balance: opts.balance }),
  };
  const manager = {
    createQueryBuilder: jest.fn((entity: unknown) =>
      entity === ProductEntity ? productQb : movementQb,
    ),
    create: jest.fn((_entity: unknown, data: unknown) => data),
    save: jest.fn(async (_entity: unknown, movement: MovementEntity) => ({
      ...movement,
      id: 'saved-movement-id',
      createdAt: new Date(),
    })),
  };
  const runner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager,
  };
  return { runner, productQb, movementQb };
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

  beforeEach(async () => {
    dataSource = {
      createQueryRunner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementsService,
        {
          provide: getRepositoryToken(MovementEntity),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(MovementsService);
  });

  it('create lanza NotFoundException si el producto no existe', async () => {
    const { runner } = buildRunnerScenario({ product: null, balance: '0' });
    dataSource.createQueryRunner.mockReturnValue(runner);

    await expect(service.create(baseDto)).rejects.toBeInstanceOf(NotFoundException);
    expect(runner.rollbackTransaction).toHaveBeenCalled();
    expect(runner.commitTransaction).not.toHaveBeenCalled();
  });

  it('create lanza BadRequestException si el producto esta inactivo', async () => {
    const inactive = {
      id: productId,
      status: ProductStatus.INACTIVE,
    } as ProductEntity;
    const { runner } = buildRunnerScenario({ product: inactive, balance: '100' });
    dataSource.createQueryRunner.mockReturnValue(runner);

    await expect(service.create(baseDto)).rejects.toBeInstanceOf(BadRequestException);
    expect(runner.rollbackTransaction).toHaveBeenCalled();
    expect(runner.commitTransaction).not.toHaveBeenCalled();
  });

  it('create lanza BadRequestException si la salida supera el stock', async () => {
    const active = {
      id: productId,
      status: ProductStatus.ACTIVE,
    } as ProductEntity;
    const { runner } = buildRunnerScenario({ product: active, balance: '3' });
    dataSource.createQueryRunner.mockReturnValue(runner);

    await expect(service.create(baseDto)).rejects.toBeInstanceOf(BadRequestException);
    expect(runner.rollbackTransaction).toHaveBeenCalled();
    expect(runner.commitTransaction).not.toHaveBeenCalled();
  });

  it('create persiste y hace commit cuando la salida es valida', async () => {
    const active = {
      id: productId,
      status: ProductStatus.ACTIVE,
    } as ProductEntity;
    const { runner } = buildRunnerScenario({ product: active, balance: '100' });
    dataSource.createQueryRunner.mockReturnValue(runner);

    const saved = await service.create({ ...baseDto, quantity: 5 });

    expect(saved.id).toBe('saved-movement-id');
    expect(runner.commitTransaction).toHaveBeenCalled();
    expect(runner.rollbackTransaction).not.toHaveBeenCalled();
    expect(runner.manager.create).toHaveBeenCalled();
    expect(runner.manager.save).toHaveBeenCalled();
  });
});

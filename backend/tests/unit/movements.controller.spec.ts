import { Test, TestingModule } from '@nestjs/testing';
import { MovementsController } from '../../src/movements/movements.controller';
import { MovementsService } from '../../src/movements/movements.service';
import {
  MovementEntity,
  MovementReason,
  MovementType,
} from '../../src/movements/entities/movement.entity';

describe('MovementsController', () => {
  let controller: MovementsController;
  const movementsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovementsController],
      providers: [{ provide: MovementsService, useValue: movementsService }],
    }).compile();

    controller = module.get(MovementsController);
    jest.clearAllMocks();
  });

  it('shouldDelegateCreateToService', async () => {
    const dto = {
      productId: '00000000-0000-4000-8000-000000000001',
      type: MovementType.IN,
      reason: MovementReason.PURCHASE,
      quantity: 1,
      date: new Date().toISOString(),
    };
    const saved = { id: 'm1' } as MovementEntity;
    movementsService.create.mockResolvedValue(saved);

    await expect(controller.create(dto)).resolves.toBe(saved);
    expect(movementsService.create).toHaveBeenCalledWith(dto);
  });

  it('shouldDelegateFindAllToService', async () => {
    const query = { productId: '00000000-0000-4000-8000-000000000001' };
    const list = [] as MovementEntity[];
    movementsService.findAll.mockResolvedValue(list);

    await expect(controller.findAll(query)).resolves.toBe(list);
    expect(movementsService.findAll).toHaveBeenCalledWith(query);
  });

  it('shouldDelegateFindOneToService', async () => {
    const id = '00000000-0000-4000-8000-000000000002';
    const movement = { id } as MovementEntity;
    movementsService.findOne.mockResolvedValue(movement);

    await expect(controller.findOne(id)).resolves.toBe(movement);
    expect(movementsService.findOne).toHaveBeenCalledWith(id);
  });
});

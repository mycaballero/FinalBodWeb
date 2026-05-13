import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import {
  ProductEntity,
  ProductStatus,
} from '../products/entities/product.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { GetMovementsQueryDto } from './dto/get-movements-query.dto';
import { MovementEntity, MovementType } from './entities/movement.entity';
import { canApplyMovement } from './stock.utils';

const STOCK_BALANCE_SELECT = `COALESCE(SUM(CASE WHEN movement.type = :inType THEN movement.quantity ELSE 0 END), 0) -
 COALESCE(SUM(CASE WHEN movement.type = :outType THEN movement.quantity ELSE 0 END), 0)`;

const STOCK_BALANCE_PARAMS = {
  inType: MovementType.IN,
  outType: MovementType.OUT,
};

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(MovementEntity)
    private readonly movementsRepository: Repository<MovementEntity>,
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateMovementDto): Promise<MovementEntity> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const product = await runner.manager
        .createQueryBuilder(ProductEntity, 'product')
        .setLock('pessimistic_write')
        .where('product.id = :id', { id: dto.productId })
        .getOne();

      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }
      if (product.status !== ProductStatus.ACTIVE) {
        throw new BadRequestException(
          'No se permiten movimientos sobre productos inactivos',
        );
      }

      const stock = await this.getStockBalance(dto.productId, runner);
      if (!canApplyMovement(stock, dto.type, dto.quantity)) {
        throw new BadRequestException(
          'Stock insuficiente para registrar la salida',
        );
      }

      const movement = runner.manager.create(MovementEntity, {
        ...dto,
        quantity: dto.quantity.toFixed(2),
        date: new Date(dto.date),
      });

      const saved = await runner.manager.save(MovementEntity, movement);
      await runner.commitTransaction();
      return saved;
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async findAll(query: GetMovementsQueryDto): Promise<MovementEntity[]> {
    if (query.from && query.to && new Date(query.from) > new Date(query.to)) {
      throw new BadRequestException(
        'El rango de fechas es invalido: from no puede ser mayor que to',
      );
    }

    const qb = this.movementsRepository.createQueryBuilder('movement');

    if (query.productId) {
      qb.andWhere('movement.productId = :productId', {
        productId: query.productId,
      });
    }
    if (query.type) {
      qb.andWhere('movement.type = :type', { type: query.type });
    }
    if (query.from) {
      qb.andWhere('movement.date >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('movement.date <= :to', { to: query.to });
    }

    return qb.orderBy('movement.date', 'DESC').getMany();
  }

  async findOne(id: string): Promise<MovementEntity> {
    const movement = await this.movementsRepository.findOne({ where: { id } });
    if (!movement) {
      throw new NotFoundException('Movimiento no encontrado');
    }
    return movement;
  }

  async calculateStockByProduct(productId: string): Promise<number> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return this.getStockBalance(productId);
  }

  private async getStockBalance(
    productId: string,
    runner?: QueryRunner,
  ): Promise<number> {
    const qb = runner
      ? runner.manager.createQueryBuilder(MovementEntity, 'movement')
      : this.movementsRepository.createQueryBuilder('movement');

    const row = await qb
      .select(STOCK_BALANCE_SELECT, 'balance')
      .setParameters(STOCK_BALANCE_PARAMS)
      .where('movement.productId = :productId', { productId })
      .getRawOne<{ balance: string }>();

    return Number(row?.balance ?? 0);
  }
}

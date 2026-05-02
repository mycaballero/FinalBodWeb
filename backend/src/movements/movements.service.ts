import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
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
      const product = await runner.manager.findOne(ProductEntity, {
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }
      if (product.status !== ProductStatus.ACTIVE) {
        throw new BadRequestException(
          'No se permiten movimientos sobre productos inactivos',
        );
      }

      const stock = await this.calculateStockByProductInTransaction(
        dto.productId,
        runner,
      );
      if (dto.type === MovementType.OUT && dto.quantity > stock) {
        throw new UnprocessableEntityException(
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
    return this.calculateStockByProductInRepository(productId);
  }

  private async calculateStockByProductInRepository(
    productId: string,
  ): Promise<number> {
    const input = await this.movementsRepository
      .createQueryBuilder('movement')
      .select('COALESCE(SUM(movement.quantity), 0)', 'total')
      .where('movement.productId = :productId', { productId })
      .andWhere('movement.type = :type', { type: MovementType.IN })
      .getRawOne<{ total: string }>();

    const output = await this.movementsRepository
      .createQueryBuilder('movement')
      .select('COALESCE(SUM(movement.quantity), 0)', 'total')
      .where('movement.productId = :productId', { productId })
      .andWhere('movement.type = :type', { type: MovementType.OUT })
      .getRawOne<{ total: string }>();

    return Number(input?.total ?? 0) - Number(output?.total ?? 0);
  }

  private async calculateStockByProductInTransaction(
    productId: string,
    runner: QueryRunner,
  ): Promise<number> {
    const input = await runner.manager
      .createQueryBuilder(MovementEntity, 'movement')
      .select('COALESCE(SUM(movement.quantity), 0)', 'total')
      .where('movement.product_id = :productId', { productId })
      .andWhere('movement.type = :type', { type: MovementType.IN })
      .getRawOne<{ total: string }>();

    const output = await runner.manager
      .createQueryBuilder(MovementEntity, 'movement')
      .select('COALESCE(SUM(movement.quantity), 0)', 'total')
      .where('movement.product_id = :productId', { productId })
      .andWhere('movement.type = :type', { type: MovementType.OUT })
      .getRawOne<{ total: string }>();

    return Number(input?.total ?? 0) - Number(output?.total ?? 0);
  }
}

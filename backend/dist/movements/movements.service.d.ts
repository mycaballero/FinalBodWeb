import { DataSource, Repository } from 'typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { GetMovementsQueryDto } from './dto/get-movements-query.dto';
import { MovementEntity } from './entities/movement.entity';
export declare class MovementsService {
    private readonly movementsRepository;
    private readonly productsRepository;
    private readonly dataSource;
    constructor(movementsRepository: Repository<MovementEntity>, productsRepository: Repository<ProductEntity>, dataSource: DataSource);
    create(dto: CreateMovementDto): Promise<MovementEntity>;
    findAll(query: GetMovementsQueryDto): Promise<MovementEntity[]>;
    findOne(id: string): Promise<MovementEntity>;
    calculateStockByProduct(productId: string): Promise<number>;
    private getStockBalance;
}

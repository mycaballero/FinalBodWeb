import { CreateMovementDto } from './dto/create-movement.dto';
import { GetMovementsQueryDto } from './dto/get-movements-query.dto';
import { MovementsService } from './movements.service';
export declare class MovementsController {
    private readonly movementsService;
    constructor(movementsService: MovementsService);
    create(dto: CreateMovementDto): Promise<import("./entities/movement.entity").MovementEntity>;
    findAll(query: GetMovementsQueryDto): Promise<import("./entities/movement.entity").MovementEntity[]>;
    findOne(id: string): Promise<import("./entities/movement.entity").MovementEntity>;
}

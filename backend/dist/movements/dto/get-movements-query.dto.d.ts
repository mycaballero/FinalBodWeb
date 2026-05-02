import { MovementType } from '../entities/movement.entity';
export declare class GetMovementsQueryDto {
    productId?: string;
    type?: MovementType;
    from?: string;
    to?: string;
}

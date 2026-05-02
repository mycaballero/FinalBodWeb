import { MovementReason, MovementType } from '../entities/movement.entity';
export declare class CreateMovementDto {
    productId: string;
    type: MovementType;
    reason: MovementReason;
    quantity: number;
    date: string;
}

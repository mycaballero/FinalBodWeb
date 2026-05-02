import { MovementType } from './entities/movement.entity';
export declare function calculateNextStock(currentStock: number, type: MovementType, quantity: number): number;
export declare function canApplyMovement(currentStock: number, type: MovementType, quantity: number): boolean;

import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { MovementReason, MovementType } from '../entities/movement.entity';

export class CreateMovementDto {
  @IsUUID()
  productId!: string;

  @IsEnum(MovementType)
  type!: MovementType;

  @IsEnum(MovementReason)
  reason!: MovementReason;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsDateString()
  @IsNotEmpty()
  date!: string;
}

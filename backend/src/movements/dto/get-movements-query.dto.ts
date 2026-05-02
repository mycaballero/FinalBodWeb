import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MovementType } from '../entities/movement.entity';

export class GetMovementsQueryDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsEnum(MovementType)
  type?: MovementType;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

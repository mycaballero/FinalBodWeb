import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductUnit } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductUnit)
  unitMeasure!: ProductUnit;

  @IsNumber()
  @Min(0)
  minimumStock!: number;
}

import { ProductUnit } from '../entities/product.entity';
export declare class CreateProductDto {
    name: string;
    description?: string;
    unitMeasure: ProductUnit;
    minimumStock: number;
}

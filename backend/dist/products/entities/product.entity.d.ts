import { MovementEntity } from '../../movements/entities/movement.entity';
export declare enum ProductUnit {
    UNITS = "unidades",
    KG = "kg",
    LITERS = "litros"
}
export declare enum ProductStatus {
    ACTIVE = "activo",
    INACTIVE = "inactivo"
}
export declare class ProductEntity {
    id: string;
    name: string;
    description: string | null;
    unitMeasure: ProductUnit;
    minimumStock: string;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    movements: MovementEntity[];
}

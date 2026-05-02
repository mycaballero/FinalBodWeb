import { ProductEntity } from '../../products/entities/product.entity';
export declare enum MovementType {
    IN = "entrada",
    OUT = "salida"
}
export declare enum MovementReason {
    PURCHASE = "compra",
    SALE = "venta",
    ADJUSTMENT = "ajuste",
    WASTE = "merma",
    RETURN = "devolucion"
}
export declare class MovementEntity {
    id: string;
    productId: string;
    type: MovementType;
    reason: MovementReason;
    quantity: string;
    date: Date;
    createdAt: Date;
    product: ProductEntity;
}

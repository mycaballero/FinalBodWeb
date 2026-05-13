import { Repository } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
export type ProductWithStockRawRow = {
    id: string;
    name: string;
    description: string | null;
    unitMeasure: ProductEntity['unitMeasure'];
    minimumStock: string;
    status: ProductEntity['status'];
    currentStock: string;
    createdAt: Date;
    updatedAt: Date;
};
export type InventoryStockRawRow = {
    productId: string;
    name: string;
    minimumStock: string;
    currentStock: string;
};
export declare class ProductStockQueryService {
    private readonly productsRepository;
    constructor(productsRepository: Repository<ProductEntity>);
    private withMovementJoin;
    private addStockAggregate;
    findAllProductsWithStockRaw(): Promise<ProductWithStockRawRow[]>;
    findOneProductWithStockRaw(id: string): Promise<ProductWithStockRawRow | null>;
    findAllInventoryStockRaw(): Promise<InventoryStockRawRow[]>;
    findOneInventoryStockRaw(productId: string): Promise<InventoryStockRawRow | null>;
}

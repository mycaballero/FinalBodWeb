import { Repository } from 'typeorm';
import { ProductEntity } from '../products/entities/product.entity';
export declare class InventoryService {
    private readonly productsRepository;
    constructor(productsRepository: Repository<ProductEntity>);
    findAll(): Promise<{
        productId: string;
        name: string;
        minimumStock: number;
        currentStock: number;
    }[]>;
    findOne(productId: string): Promise<{
        productId: string;
        name: string;
        minimumStock: number;
        currentStock: number;
    }>;
    findLowStockAlerts(): Promise<{
        productId: string;
        name: string;
        minimumStock: number;
        currentStock: number;
    }[]>;
}

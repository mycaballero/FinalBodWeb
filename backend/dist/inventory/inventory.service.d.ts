import { ProductStockQueryService } from '../common/services/product-stock-query.service';
export declare class InventoryService {
    private readonly productStockQuery;
    constructor(productStockQuery: ProductStockQueryService);
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

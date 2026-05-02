import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(): Promise<{
        productId: string;
        name: string;
        minimumStock: number;
        currentStock: number;
    }[]>;
    findLowStock(): Promise<{
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
}

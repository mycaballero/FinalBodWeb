import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
export interface ProductWithStock {
    id: string;
    name: string;
    description: string | null;
    unitMeasure: ProductEntity['unitMeasure'];
    minimumStock: number;
    status: ProductEntity['status'];
    currentStock: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ProductsService {
    private readonly productsRepository;
    constructor(productsRepository: Repository<ProductEntity>);
    create(dto: CreateProductDto): Promise<ProductEntity>;
    findAll(): Promise<ProductWithStock[]>;
    findOne(id: string): Promise<ProductWithStock>;
    private getEntityById;
    update(id: string, dto: UpdateProductDto): Promise<ProductEntity>;
    deactivate(id: string): Promise<ProductEntity>;
}

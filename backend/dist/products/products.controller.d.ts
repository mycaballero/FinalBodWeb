import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductWithStock, ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(dto: CreateProductDto): Promise<ProductEntity>;
    findAll(): Promise<ProductWithStock[]>;
    findOne(id: string): Promise<ProductWithStock>;
    update(id: string, dto: UpdateProductDto): Promise<ProductEntity>;
    deactivate(id: string): Promise<ProductEntity>;
}

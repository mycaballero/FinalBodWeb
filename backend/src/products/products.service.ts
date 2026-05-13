import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductStockQueryService } from '../common/services/product-stock-query.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity, ProductStatus } from './entities/product.entity';

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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    private readonly productStockQuery: ProductStockQueryService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const existing = await this.productsRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('El producto ya existe');
    }

    const created = this.productsRepository.create({
      ...dto,
      minimumStock: dto.minimumStock.toFixed(2),
    });
    return this.productsRepository.save(created);
  }

  async findAll(): Promise<ProductWithStock[]> {
    const rows = await this.productStockQuery.findAllProductsWithStockRaw();
    return rows.map((row) => ({
      ...row,
      minimumStock: Number(row.minimumStock),
      currentStock: Number(row.currentStock),
    }));
  }

  async findOne(id: string): Promise<ProductWithStock> {
    const row = await this.productStockQuery.findOneProductWithStockRaw(id);
    if (!row) {
      throw new NotFoundException('Producto no encontrado');
    }
    return {
      ...row,
      minimumStock: Number(row.minimumStock),
      currentStock: Number(row.currentStock),
    };
  }

  private async getEntityById(id: string): Promise<ProductEntity> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const product = await this.getEntityById(id);

    if (dto.name && dto.name !== product.name) {
      const duplicated = await this.productsRepository.findOne({
        where: { name: dto.name },
      });
      if (duplicated) {
        throw new ConflictException('Ya existe un producto con ese nombre');
      }
    }

    if (dto.minimumStock !== undefined) {
      product.minimumStock = dto.minimumStock.toFixed(2);
    }

    if (dto.name !== undefined) {
      product.name = dto.name;
    }
    if (dto.description !== undefined) {
      product.description = dto.description;
    }
    if (dto.unitMeasure !== undefined) {
      product.unitMeasure = dto.unitMeasure;
    }

    return this.productsRepository.save(product);
  }

  async deactivate(id: string): Promise<ProductEntity> {
    const product = await this.getEntityById(id);
    product.status = ProductStatus.INACTIVE;
    return this.productsRepository.save(product);
  }
}

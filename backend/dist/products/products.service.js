"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_stock_query_service_1 = require("../common/services/product-stock-query.service");
const product_entity_1 = require("./entities/product.entity");
let ProductsService = class ProductsService {
    productsRepository;
    productStockQuery;
    constructor(productsRepository, productStockQuery) {
        this.productsRepository = productsRepository;
        this.productStockQuery = productStockQuery;
    }
    async create(dto) {
        const existing = await this.productsRepository.findOne({
            where: { name: dto.name },
        });
        if (existing) {
            throw new common_1.ConflictException('El producto ya existe');
        }
        const created = this.productsRepository.create({
            ...dto,
            minimumStock: dto.minimumStock.toFixed(2),
        });
        return this.productsRepository.save(created);
    }
    async findAll() {
        const rows = await this.productStockQuery.findAllProductsWithStockRaw();
        return rows.map((row) => ({
            ...row,
            minimumStock: Number(row.minimumStock),
            currentStock: Number(row.currentStock),
        }));
    }
    async findOne(id) {
        const row = await this.productStockQuery.findOneProductWithStockRaw(id);
        if (!row) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        return {
            ...row,
            minimumStock: Number(row.minimumStock),
            currentStock: Number(row.currentStock),
        };
    }
    async getEntityById(id) {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        return product;
    }
    async update(id, dto) {
        const product = await this.getEntityById(id);
        if (dto.name && dto.name !== product.name) {
            const duplicated = await this.productsRepository.findOne({
                where: { name: dto.name },
            });
            if (duplicated) {
                throw new common_1.ConflictException('Ya existe un producto con ese nombre');
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
    async deactivate(id) {
        const product = await this.getEntityById(id);
        product.status = product_entity_1.ProductStatus.INACTIVE;
        return this.productsRepository.save(product);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        product_stock_query_service_1.ProductStockQueryService])
], ProductsService);
//# sourceMappingURL=products.service.js.map
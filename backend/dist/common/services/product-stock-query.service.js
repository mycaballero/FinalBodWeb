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
exports.ProductStockQueryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const movement_entity_1 = require("../../movements/entities/movement.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const STOCK_SUM_SQL = `COALESCE(SUM(CASE WHEN movement.type = :inType THEN movement.quantity ELSE 0 END), 0) -
 COALESCE(SUM(CASE WHEN movement.type = :outType THEN movement.quantity ELSE 0 END), 0)`;
const STOCK_PARAMS = { inType: movement_entity_1.MovementType.IN, outType: movement_entity_1.MovementType.OUT };
let ProductStockQueryService = class ProductStockQueryService {
    productsRepository;
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    withMovementJoin() {
        return this.productsRepository
            .createQueryBuilder('product')
            .leftJoin('product.movements', 'movement');
    }
    addStockAggregate(qb, alias) {
        return qb.addSelect(STOCK_SUM_SQL, alias).setParameters(STOCK_PARAMS);
    }
    async findAllProductsWithStockRaw() {
        const qb = this.withMovementJoin()
            .select('product.id', 'id')
            .addSelect('product.name', 'name')
            .addSelect('product.description', 'description')
            .addSelect('product.unitMeasure', 'unitMeasure')
            .addSelect('product.minimumStock', 'minimumStock')
            .addSelect('product.status', 'status')
            .addSelect('product.createdAt', 'createdAt')
            .addSelect('product.updatedAt', 'updatedAt');
        this.addStockAggregate(qb, 'currentStock');
        return qb
            .groupBy('product.id')
            .addGroupBy('product.name')
            .addGroupBy('product.description')
            .addGroupBy('product.unitMeasure')
            .addGroupBy('product.minimumStock')
            .addGroupBy('product.status')
            .addGroupBy('product.createdAt')
            .addGroupBy('product.updatedAt')
            .orderBy('product.createdAt', 'DESC')
            .getRawMany();
    }
    async findOneProductWithStockRaw(id) {
        const qb = this.withMovementJoin()
            .select('product.id', 'id')
            .addSelect('product.name', 'name')
            .addSelect('product.description', 'description')
            .addSelect('product.unitMeasure', 'unitMeasure')
            .addSelect('product.minimumStock', 'minimumStock')
            .addSelect('product.status', 'status')
            .addSelect('product.createdAt', 'createdAt')
            .addSelect('product.updatedAt', 'updatedAt');
        this.addStockAggregate(qb, 'currentStock');
        const row = await qb
            .where('product.id = :id', { id })
            .groupBy('product.id')
            .addGroupBy('product.name')
            .addGroupBy('product.description')
            .addGroupBy('product.unitMeasure')
            .addGroupBy('product.minimumStock')
            .addGroupBy('product.status')
            .addGroupBy('product.createdAt')
            .addGroupBy('product.updatedAt')
            .getRawOne();
        return row ?? null;
    }
    async findAllInventoryStockRaw() {
        const qb = this.withMovementJoin()
            .select('product.id', 'productId')
            .addSelect('product.name', 'name')
            .addSelect('product.minimumStock', 'minimumStock');
        this.addStockAggregate(qb, 'currentStock');
        return qb
            .groupBy('product.id')
            .addGroupBy('product.name')
            .addGroupBy('product.minimumStock')
            .getRawMany();
    }
    async findOneInventoryStockRaw(productId) {
        const qb = this.withMovementJoin()
            .select('product.id', 'productId')
            .addSelect('product.name', 'name')
            .addSelect('product.minimumStock', 'minimumStock');
        this.addStockAggregate(qb, 'currentStock');
        const row = await qb
            .where('product.id = :id', { id: productId })
            .groupBy('product.id')
            .addGroupBy('product.name')
            .addGroupBy('product.minimumStock')
            .getRawOne();
        return row ?? null;
    }
};
exports.ProductStockQueryService = ProductStockQueryService;
exports.ProductStockQueryService = ProductStockQueryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductStockQueryService);
//# sourceMappingURL=product-stock-query.service.js.map
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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const movement_entity_1 = require("../movements/entities/movement.entity");
const product_entity_1 = require("../products/entities/product.entity");
let InventoryService = class InventoryService {
    productsRepository;
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    async findAll() {
        const rows = await this.productsRepository
            .createQueryBuilder('product')
            .leftJoin('product.movements', 'movement')
            .select('product.id', 'productId')
            .addSelect('product.name', 'name')
            .addSelect('product.minimumStock', 'minimumStock')
            .addSelect(`COALESCE(SUM(CASE WHEN movement.type = :inType THEN movement.quantity ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN movement.type = :outType THEN movement.quantity ELSE 0 END), 0)`, 'currentStock')
            .setParameters({ inType: movement_entity_1.MovementType.IN, outType: movement_entity_1.MovementType.OUT })
            .groupBy('product.id')
            .addGroupBy('product.name')
            .addGroupBy('product.minimumStock')
            .getRawMany();
        return rows.map((row) => ({
            productId: row.productId,
            name: row.name,
            minimumStock: Number(row.minimumStock),
            currentStock: Number(row.currentStock),
        }));
    }
    async findOne(productId) {
        const all = await this.findAll();
        const target = all.find((item) => item.productId === productId);
        if (!target) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        return target;
    }
    async findLowStockAlerts() {
        const all = await this.findAll();
        return all.filter((item) => item.currentStock <= item.minimumStock);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map
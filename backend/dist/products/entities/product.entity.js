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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductEntity = exports.ProductStatus = exports.ProductUnit = void 0;
const typeorm_1 = require("typeorm");
const movement_entity_1 = require("../../movements/entities/movement.entity");
var ProductUnit;
(function (ProductUnit) {
    ProductUnit["UNITS"] = "unidades";
    ProductUnit["KG"] = "kg";
    ProductUnit["LITERS"] = "litros";
})(ProductUnit || (exports.ProductUnit = ProductUnit = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "activo";
    ProductStatus["INACTIVE"] = "inactivo";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
let ProductEntity = class ProductEntity {
    id;
    name;
    description;
    unitMeasure;
    minimumStock;
    status;
    createdAt;
    updatedAt;
    movements;
};
exports.ProductEntity = ProductEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProductEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], ProductEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ProductEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ProductUnit, name: 'unit_measure' }),
    __metadata("design:type", String)
], ProductEntity.prototype, "unitMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 12,
        scale: 2,
        default: 0,
        name: 'minimum_stock',
    }),
    __metadata("design:type", String)
], ProductEntity.prototype, "minimumStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE }),
    __metadata("design:type", String)
], ProductEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ProductEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ProductEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => movement_entity_1.MovementEntity, (movement) => movement.product),
    __metadata("design:type", Array)
], ProductEntity.prototype, "movements", void 0);
exports.ProductEntity = ProductEntity = __decorate([
    (0, typeorm_1.Entity)('products'),
    (0, typeorm_1.Index)('uq_products_name', ['name'], { unique: true })
], ProductEntity);
//# sourceMappingURL=product.entity.js.map
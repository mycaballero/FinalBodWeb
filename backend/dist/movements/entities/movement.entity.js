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
exports.MovementEntity = exports.MovementReason = exports.MovementType = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
var MovementType;
(function (MovementType) {
    MovementType["IN"] = "entrada";
    MovementType["OUT"] = "salida";
})(MovementType || (exports.MovementType = MovementType = {}));
var MovementReason;
(function (MovementReason) {
    MovementReason["PURCHASE"] = "compra";
    MovementReason["SALE"] = "venta";
    MovementReason["ADJUSTMENT"] = "ajuste";
    MovementReason["WASTE"] = "merma";
    MovementReason["RETURN"] = "devolucion";
})(MovementReason || (exports.MovementReason = MovementReason = {}));
let MovementEntity = class MovementEntity {
    id;
    productId;
    type;
    reason;
    quantity;
    date;
    createdAt;
    product;
};
exports.MovementEntity = MovementEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MovementEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'product_id' }),
    __metadata("design:type", String)
], MovementEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MovementType }),
    __metadata("design:type", String)
], MovementEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MovementReason }),
    __metadata("design:type", String)
], MovementEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", String)
], MovementEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], MovementEntity.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MovementEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.ProductEntity, (product) => product.movements, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.ProductEntity)
], MovementEntity.prototype, "product", void 0);
exports.MovementEntity = MovementEntity = __decorate([
    (0, typeorm_1.Entity)('movements'),
    (0, typeorm_1.Index)('idx_movements_product_date', ['productId', 'date']),
    (0, typeorm_1.Index)('idx_movements_type', ['type'])
], MovementEntity);
//# sourceMappingURL=movement.entity.js.map
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
exports.MovementsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/entities/product.entity");
const movement_entity_1 = require("./entities/movement.entity");
const stock_utils_1 = require("./stock.utils");
const STOCK_BALANCE_SELECT = `COALESCE(SUM(CASE WHEN movement.type = :inType THEN movement.quantity ELSE 0 END), 0) -
 COALESCE(SUM(CASE WHEN movement.type = :outType THEN movement.quantity ELSE 0 END), 0)`;
const STOCK_BALANCE_PARAMS = {
    inType: movement_entity_1.MovementType.IN,
    outType: movement_entity_1.MovementType.OUT,
};
let MovementsService = class MovementsService {
    movementsRepository;
    productsRepository;
    dataSource;
    constructor(movementsRepository, productsRepository, dataSource) {
        this.movementsRepository = movementsRepository;
        this.productsRepository = productsRepository;
        this.dataSource = dataSource;
    }
    async create(dto) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            const product = await runner.manager
                .createQueryBuilder(product_entity_1.ProductEntity, 'product')
                .setLock('pessimistic_write')
                .where('product.id = :id', { id: dto.productId })
                .getOne();
            if (!product) {
                throw new common_1.NotFoundException('Producto no encontrado');
            }
            if (product.status !== product_entity_1.ProductStatus.ACTIVE) {
                throw new common_1.BadRequestException('No se permiten movimientos sobre productos inactivos');
            }
            const stock = await this.getStockBalance(dto.productId, runner);
            if (!(0, stock_utils_1.canApplyMovement)(stock, dto.type, dto.quantity)) {
                throw new common_1.BadRequestException('Stock insuficiente para registrar la salida');
            }
            const movement = runner.manager.create(movement_entity_1.MovementEntity, {
                ...dto,
                quantity: dto.quantity.toFixed(2),
                date: new Date(dto.date),
            });
            const saved = await runner.manager.save(movement_entity_1.MovementEntity, movement);
            await runner.commitTransaction();
            return saved;
        }
        catch (error) {
            await runner.rollbackTransaction();
            throw error;
        }
        finally {
            await runner.release();
        }
    }
    async findAll(query) {
        if (query.from && query.to && new Date(query.from) > new Date(query.to)) {
            throw new common_1.BadRequestException('El rango de fechas es invalido: from no puede ser mayor que to');
        }
        const qb = this.movementsRepository.createQueryBuilder('movement');
        if (query.productId) {
            qb.andWhere('movement.productId = :productId', {
                productId: query.productId,
            });
        }
        if (query.type) {
            qb.andWhere('movement.type = :type', { type: query.type });
        }
        if (query.from) {
            qb.andWhere('movement.date >= :from', { from: query.from });
        }
        if (query.to) {
            qb.andWhere('movement.date <= :to', { to: query.to });
        }
        return qb.orderBy('movement.date', 'DESC').getMany();
    }
    async findOne(id) {
        const movement = await this.movementsRepository.findOne({ where: { id } });
        if (!movement) {
            throw new common_1.NotFoundException('Movimiento no encontrado');
        }
        return movement;
    }
    async calculateStockByProduct(productId) {
        const product = await this.productsRepository.findOne({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        return this.getStockBalance(productId);
    }
    async getStockBalance(productId, runner) {
        const qb = runner
            ? runner.manager.createQueryBuilder(movement_entity_1.MovementEntity, 'movement')
            : this.movementsRepository.createQueryBuilder('movement');
        const row = await qb
            .select(STOCK_BALANCE_SELECT, 'balance')
            .setParameters(STOCK_BALANCE_PARAMS)
            .where('movement.productId = :productId', { productId })
            .getRawOne();
        return Number(row?.balance ?? 0);
    }
};
exports.MovementsService = MovementsService;
exports.MovementsService = MovementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(movement_entity_1.MovementEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(2, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], MovementsService);
//# sourceMappingURL=movements.service.js.map
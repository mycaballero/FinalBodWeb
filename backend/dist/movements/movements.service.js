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
            const product = await runner.manager.findOne(product_entity_1.ProductEntity, {
                where: { id: dto.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException('Producto no encontrado');
            }
            if (product.status !== product_entity_1.ProductStatus.ACTIVE) {
                throw new common_1.BadRequestException('No se permiten movimientos sobre productos inactivos');
            }
            const stock = await this.calculateStockByProductInTransaction(dto.productId, runner);
            if (dto.type === movement_entity_1.MovementType.OUT && dto.quantity > stock) {
                throw new common_1.UnprocessableEntityException('Stock insuficiente para registrar la salida');
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
        return this.calculateStockByProductInRepository(productId);
    }
    async calculateStockByProductInRepository(productId) {
        const input = await this.movementsRepository
            .createQueryBuilder('movement')
            .select('COALESCE(SUM(movement.quantity), 0)', 'total')
            .where('movement.productId = :productId', { productId })
            .andWhere('movement.type = :type', { type: movement_entity_1.MovementType.IN })
            .getRawOne();
        const output = await this.movementsRepository
            .createQueryBuilder('movement')
            .select('COALESCE(SUM(movement.quantity), 0)', 'total')
            .where('movement.productId = :productId', { productId })
            .andWhere('movement.type = :type', { type: movement_entity_1.MovementType.OUT })
            .getRawOne();
        return Number(input?.total ?? 0) - Number(output?.total ?? 0);
    }
    async calculateStockByProductInTransaction(productId, runner) {
        const input = await runner.manager
            .createQueryBuilder(movement_entity_1.MovementEntity, 'movement')
            .select('COALESCE(SUM(movement.quantity), 0)', 'total')
            .where('movement.product_id = :productId', { productId })
            .andWhere('movement.type = :type', { type: movement_entity_1.MovementType.IN })
            .getRawOne();
        const output = await runner.manager
            .createQueryBuilder(movement_entity_1.MovementEntity, 'movement')
            .select('COALESCE(SUM(movement.quantity), 0)', 'total')
            .where('movement.product_id = :productId', { productId })
            .andWhere('movement.type = :type', { type: movement_entity_1.MovementType.OUT })
            .getRawOne();
        return Number(input?.total ?? 0) - Number(output?.total ?? 0);
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
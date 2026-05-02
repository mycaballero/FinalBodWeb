"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
const typeorm_1 = require("typeorm");
const movement_entity_1 = require("../movements/entities/movement.entity");
const product_entity_1 = require("../products/entities/product.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'finalbodweb',
    synchronize: false,
    logging: false,
    entities: [product_entity_1.ProductEntity, movement_entity_1.MovementEntity],
    migrations: ['src/database/migrations/*.ts'],
});
//# sourceMappingURL=data-source.js.map
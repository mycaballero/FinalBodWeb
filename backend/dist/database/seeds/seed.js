"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const data_source_1 = require("../data-source");
const movement_entity_1 = require("../../movements/entities/movement.entity");
const product_entity_1 = require("../../products/entities/product.entity");
async function runSeed() {
    const dataSource = await data_source_1.AppDataSource.initialize();
    const productRepository = dataSource.getRepository(product_entity_1.ProductEntity);
    const movementRepository = dataSource.getRepository(movement_entity_1.MovementEntity);
    const defaults = [
        {
            name: 'Arroz integral',
            unitMeasure: product_entity_1.ProductUnit.KG,
            minimumStock: '10.00',
        },
        {
            name: 'Agua mineral',
            unitMeasure: product_entity_1.ProductUnit.LITERS,
            minimumStock: '20.00',
        },
        {
            name: 'Barras de proteina',
            unitMeasure: product_entity_1.ProductUnit.UNITS,
            minimumStock: '30.00',
        },
    ];
    for (const item of defaults) {
        let product = await productRepository.findOne({
            where: { name: item.name },
        });
        if (!product) {
            product = await productRepository.save(productRepository.create({
                ...item,
                status: product_entity_1.ProductStatus.ACTIVE,
                description: `Producto semilla: ${item.name}`,
            }));
        }
        const existingInput = await movementRepository.findOne({
            where: {
                productId: product.id,
                type: movement_entity_1.MovementType.IN,
                reason: movement_entity_1.MovementReason.PURCHASE,
            },
        });
        if (!existingInput) {
            await movementRepository.save(movementRepository.create({
                productId: product.id,
                type: movement_entity_1.MovementType.IN,
                reason: movement_entity_1.MovementReason.PURCHASE,
                quantity: '100.00',
                date: new Date(),
            }));
        }
    }
    await dataSource.destroy();
}
runSeed()
    .then(() => {
    console.log('Seed ejecutada correctamente');
})
    .catch((error) => {
    console.error('Error en seed', error);
    process.exitCode = 1;
});
//# sourceMappingURL=seed.js.map
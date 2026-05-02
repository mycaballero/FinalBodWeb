import 'dotenv/config';
import { AppDataSource } from '../data-source';
import {
  MovementEntity,
  MovementReason,
  MovementType,
} from '../../movements/entities/movement.entity';
import {
  ProductEntity,
  ProductStatus,
  ProductUnit,
} from '../../products/entities/product.entity';

async function runSeed() {
  const dataSource = await AppDataSource.initialize();
  const productRepository = dataSource.getRepository(ProductEntity);
  const movementRepository = dataSource.getRepository(MovementEntity);

  const defaults = [
    {
      name: 'Arroz integral',
      unitMeasure: ProductUnit.KG,
      minimumStock: '10.00',
    },
    {
      name: 'Agua mineral',
      unitMeasure: ProductUnit.LITERS,
      minimumStock: '20.00',
    },
    {
      name: 'Barras de proteina',
      unitMeasure: ProductUnit.UNITS,
      minimumStock: '30.00',
    },
  ];

  for (const item of defaults) {
    let product = await productRepository.findOne({
      where: { name: item.name },
    });
    if (!product) {
      product = await productRepository.save(
        productRepository.create({
          ...item,
          status: ProductStatus.ACTIVE,
          description: `Producto semilla: ${item.name}`,
        }),
      );
    }

    const existingInput = await movementRepository.findOne({
      where: {
        productId: product.id,
        type: MovementType.IN,
        reason: MovementReason.PURCHASE,
      },
    });

    if (!existingInput) {
      await movementRepository.save(
        movementRepository.create({
          productId: product.id,
          type: MovementType.IN,
          reason: MovementReason.PURCHASE,
          quantity: '100.00',
          date: new Date(),
        }),
      );
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

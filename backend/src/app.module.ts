import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { MovementsModule } from './movements/movements.module';
import { InventoryModule } from './inventory/inventory.module';
import { CommonModule } from './common/common.module';
import { ProductEntity } from './products/entities/product.entity';
import { MovementEntity } from './movements/entities/movement.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'finalbodweb'),
        autoLoadEntities: true,
        synchronize: false,
        entities: [ProductEntity, MovementEntity],
      }),
    }),
    ProductsModule,
    MovementsModule,
    InventoryModule,
    CommonModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { HealthController } from './health.controller';
import { ProductStockQueryService } from './services/product-stock-query.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [HealthController],
  providers: [ProductStockQueryService],
  exports: [ProductStockQueryService],
})
export class CommonModule {}

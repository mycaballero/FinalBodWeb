import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementsController } from './movements.controller';
import { MovementsService } from './movements.service';
import { MovementEntity } from './entities/movement.entity';
import { ProductEntity } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovementEntity, ProductEntity])],
  controllers: [MovementsController],
  providers: [MovementsService],
  exports: [MovementsService],
})
export class MovementsModule {}

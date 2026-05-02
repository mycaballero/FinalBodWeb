import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';

export enum MovementType {
  IN = 'entrada',
  OUT = 'salida',
}

export enum MovementReason {
  PURCHASE = 'compra',
  SALE = 'venta',
  ADJUSTMENT = 'ajuste',
  WASTE = 'merma',
  RETURN = 'devolucion',
}

@Entity('movements')
@Index('idx_movements_product_date', ['productId', 'date'])
@Index('idx_movements_type', ['type'])
export class MovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @Column({ type: 'enum', enum: MovementType })
  type!: MovementType;

  @Column({ type: 'enum', enum: MovementReason })
  reason!: MovementReason;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  quantity!: string;

  @Column({ type: 'timestamptz' })
  date!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => ProductEntity, (product) => product.movements, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MovementEntity } from '../../movements/entities/movement.entity';

export enum ProductUnit {
  UNITS = 'unidades',
  KG = 'kg',
  LITERS = 'litros',
}

export enum ProductStatus {
  ACTIVE = 'activo',
  INACTIVE = 'inactivo',
}

@Entity('products')
@Index('uq_products_name', ['name'], { unique: true })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: ProductUnit, name: 'unit_measure' })
  unitMeasure!: ProductUnit;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'minimum_stock',
  })
  minimumStock!: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status!: ProductStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => MovementEntity, (movement) => movement.product)
  movements!: MovementEntity[];
}

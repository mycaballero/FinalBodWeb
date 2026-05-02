import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1714392000000 implements MigrationInterface {
  name = 'InitSchema1714392000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TYPE "public"."products_unit_measure_enum" AS ENUM('unidades', 'kg', 'litros')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_status_enum" AS ENUM('activo', 'inactivo')`,
    );
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(120) NOT NULL,
        "description" text,
        "unit_measure" "public"."products_unit_measure_enum" NOT NULL,
        "minimum_stock" numeric(12,2) NOT NULL DEFAULT '0',
        "status" "public"."products_status_enum" NOT NULL DEFAULT 'activo',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "uq_products_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(
      `CREATE TYPE "public"."movements_type_enum" AS ENUM('entrada', 'salida')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."movements_reason_enum" AS ENUM('compra', 'venta', 'ajuste', 'merma', 'devolucion')`,
    );
    await queryRunner.query(`
      CREATE TABLE "movements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "type" "public"."movements_type_enum" NOT NULL,
        "reason" "public"."movements_reason_enum" NOT NULL,
        "quantity" numeric(12,2) NOT NULL,
        "date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_movements_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "movements"
      ADD CONSTRAINT "FK_movements_product_id"
      FOREIGN KEY ("product_id")
      REFERENCES "products"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_movements_product_date" ON "movements" ("product_id", "date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_movements_type" ON "movements" ("type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_movements_type"`);
    await queryRunner.query(`DROP INDEX "public"."idx_movements_product_date"`);
    await queryRunner.query(
      `ALTER TABLE "movements" DROP CONSTRAINT "FK_movements_product_id"`,
    );
    await queryRunner.query(`DROP TABLE "movements"`);
    await queryRunner.query(`DROP TYPE "public"."movements_reason_enum"`);
    await queryRunner.query(`DROP TYPE "public"."movements_type_enum"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."products_unit_measure_enum"`);
  }
}

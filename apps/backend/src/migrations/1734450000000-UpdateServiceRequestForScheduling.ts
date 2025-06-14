import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateServiceRequestForScheduling1734450000000 implements MigrationInterface {
  name = 'UpdateServiceRequestForScheduling1734450000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tabla de ofertas ya que no se usará más
    await queryRunner.query(`DROP TABLE IF EXISTS "service_request_offer"`);

    // Eliminar columnas de precio de service_request
    await queryRunner.dropColumn('service_request', 'clientPrice');
    await queryRunner.dropColumn('service_request', 'technicianPrice');

    // Agregar columna para fecha propuesta
    await queryRunner.addColumn(
      'service_request',
      new TableColumn({
        name: 'proposedDateTime',
        type: 'timestamp',
        isNullable: false,
      })
    );

    // Actualizar columna expiresAt para usar 24 horas por defecto
    await queryRunner.query(`
      UPDATE "service_request" 
      SET "expiresAt" = "createdAt" + INTERVAL '24 hours' 
      WHERE "expiresAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios
    await queryRunner.dropColumn('service_request', 'proposedDateTime');

    // Restaurar columnas de precio
    await queryRunner.addColumn(
      'service_request',
      new TableColumn({
        name: 'clientPrice',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: false,
        default: 0,
      })
    );

    await queryRunner.addColumn(
      'service_request',
      new TableColumn({
        name: 'technicianPrice',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      })
    );

    // Recrear tabla de ofertas (estructura básica)
    await queryRunner.query(`
      CREATE TABLE "service_request_offer" (
        "id" SERIAL NOT NULL,
        "serviceRequestId" integer NOT NULL,
        "technicianId" integer,
        "clientId" integer,
        "price" numeric(10,2) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "comment" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "resolvedAt" TIMESTAMP,
        CONSTRAINT "PK_service_request_offer" PRIMARY KEY ("id")
      )
    `);
  }
}
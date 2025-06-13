import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddClientOffers1734400000000 implements MigrationInterface {
  name = 'AddClientOffers1734400000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add clientId column to service_request_offer table
    await queryRunner.addColumn(
      'service_request_offer',
      new TableColumn({
        name: 'clientId',
        type: 'int',
        isNullable: true,
      })
    )

    // Make technicianId nullable since now offers can come from clients too
    await queryRunner.changeColumn(
      'service_request_offer',
      'technicianId',
      new TableColumn({
        name: 'technicianId',
        type: 'int',
        isNullable: true,
      })
    )

    // Add foreign key constraint for clientId
    await queryRunner.query(`
      ALTER TABLE "service_request_offer" 
      ADD CONSTRAINT "FK_service_request_offer_client" 
      FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "service_request_offer" 
      DROP CONSTRAINT "FK_service_request_offer_client"
    `)

    // Drop clientId column
    await queryRunner.dropColumn('service_request_offer', 'clientId')

    // Make technicianId not nullable again
    await queryRunner.changeColumn(
      'service_request_offer',
      'technicianId',
      new TableColumn({
        name: 'technicianId',
        type: 'int',
        isNullable: false,
      })
    )
  }
}
